const os = require('os');
const path = require('path');
const fs = require('fs');

const TEST_DB = path.join(os.tmpdir(), `sesam-agendamentos-${Date.now()}.db`);
process.env.DB_PATH = TEST_DB;

const request = require('supertest');
const bcrypt = require('bcryptjs');

let app, db, agent;

// IDs populated in beforeAll
let viagemId;          // future trip for most tests
let viagemPassadaId;   // past trip for cancel guard test
let ag1Id;             // used for: create + duplicate + cancel
let ag2Id;             // used for: Presente → Voltou no Dia flow + second presença + second retorno
let ag3Id;             // used for: Faltou → retorno rejected
let ag4Id;             // created in past viagem, for cancel guard

const VALID_AGENDAMENTO = {
  motivo_deslocamento: 'Consulta oncológica mensal',
  ponto_desembarque_teresina: 'H.U.',
  destino_consulta: 'HUPI Oncologia',
};

async function criarPaciente(nome, cpf, telefone) {
  const res = await agent.post('/api/pacientes').send({
    nome,
    cpf,
    telefone,
    ponto_embarque: 'SESAM',
    prioridade: 'Normal',
  });
  if (res.status !== 201) throw new Error(`Paciente creation failed for CPF ${cpf}: ${JSON.stringify(res.body)}`);
  return res.body.id;
}

async function criarAgendamento(viagId, pacId) {
  const res = await agent
    .post(`/api/viagens/${viagId}/agendamentos`)
    .send({ paciente_id: pacId, ...VALID_AGENDAMENTO });
  if (res.status !== 201) throw new Error(`Agendamento creation failed: ${JSON.stringify(res.body)}`);
  return res.body.id;
}

beforeAll(async () => {
  app = require('../../src/app');
  db = require('../../src/db');

  const hash = bcrypt.hashSync('admin123', 1);
  db.prepare("INSERT INTO usuarios (login, senha_hash) VALUES (?, ?)").run('admin', hash);
  db.prepare("INSERT INTO motoristas (id, nome) VALUES (1, 'Henrique')").run();
  db.prepare("INSERT INTO motoristas (id, nome) VALUES (2, 'Claudio')").run();

  agent = request.agent(app);
  const loginRes = await agent.post('/api/auth/login').send({ login: 'admin', senha: 'admin123' });
  expect(loginRes.status).toBe(200);

  // Create future viagem
  const v = await agent.post('/api/viagens').send({
    data: '2030-11-15',
    motorista_id: 1,
    placa: 'ABC-1234',
    modelo_veiculo: 'Sprinter 415',
  });
  expect(v.status).toBe(201);
  viagemId = v.body.id;

  // Create past viagem via DB directly
  const vp = db.prepare(
    "INSERT INTO viagens (data, motorista_id, placa, capacidade_maxima, vagas_ocupadas) VALUES ('2020-01-01', 1, 'OLD-0001', 28, 0)"
  ).run();
  viagemPassadaId = vp.lastInsertRowid;

  // Create 4 patients with known valid CPFs
  const p1 = await criarPaciente('Maria da Silva',  '529.982.247-25', '(86) 99999-0001');
  const p2 = await criarPaciente('João Testes',     '111.444.777-35', '(86) 99999-0002');
  const p3 = await criarPaciente('Ana Faltante',    '000.000.001-91', '(86) 99999-0003');
  const p4 = await criarPaciente('Pedro Cancelado', '987.654.321-00', '(86) 99999-0004');

  // Create agendamentos for future viagem
  ag1Id = await criarAgendamento(viagemId, p1); // for cancel test
  ag2Id = await criarAgendamento(viagemId, p2); // for Presente → retorno flow
  ag3Id = await criarAgendamento(viagemId, p3); // for Faltou → retorno rejected

  // Create past-trip agendamento directly (bypassing date guard for setup)
  const pastAg = db.prepare(`
    INSERT INTO agendamentos (viagem_id, paciente_id, motivo_deslocamento, ponto_desembarque_teresina, destino_consulta)
    VALUES (?, ?, 'Consulta passada', 'H.U.', 'HUPI Oncologia')
  `).run(viagemPassadaId, p4);
  ag4Id = pastAg.lastInsertRowid;

  // Pre-mark ag2 as Presente and ag3 as Faltou so retorno tests can run
  db.prepare("UPDATE agendamentos SET status_presenca = 'Presente' WHERE id = ?").run(ag2Id);
  db.prepare("UPDATE agendamentos SET status_presenca = 'Faltou'  WHERE id = ?").run(ag3Id);
});

afterAll(() => {
  db.close();
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST agendamentos
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/viagens/:id/agendamentos', () => {
  it('reports the created agendamento in response body', async () => {
    const res = await agent.get(`/api/viagens/${viagemId}`);
    expect(res.status).toBe(200);
    expect(res.body.agendamentos.some((a) => a.id === ag1Id)).toBe(true);
    expect(res.body.vagas_ocupadas).toBe(3); // 3 patients, no companions
  });

  it('returns 409 when same patient is scheduled twice on same trip', async () => {
    const res = await agent.post(`/api/viagens/${viagemId}/agendamentos`).send({
      paciente_id: (await agent.get('/api/pacientes')).body[0].id,
      ...VALID_AGENDAMENTO,
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/já agendado/i);
  });

  it('returns 409 when trip is at capacity', async () => {
    db.prepare('UPDATE viagens SET vagas_ocupadas = 28 WHERE id = ?').run(viagemId);
    const extraPatient = await criarPaciente('Novo Paciente', '111.555.999-00', '(86) 99999-0005');
    const res = await agent.post(`/api/viagens/${viagemId}/agendamentos`).send({
      paciente_id: extraPatient,
      ...VALID_AGENDAMENTO,
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/vagas/i);
    // Restore
    db.prepare('UPDATE viagens SET vagas_ocupadas = 3 WHERE id = ?').run(viagemId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH presença
// ─────────────────────────────────────────────────────────────────────────────

describe('PATCH /api/agendamentos/:id/presenca', () => {
  it('marks ag1 as Presente', async () => {
    const res = await agent
      .patch(`/api/agendamentos/${ag1Id}/presenca`)
      .send({ status: 'Presente' });
    expect(res.status).toBe(200);
    expect(res.body.status_presenca).toBe('Presente');
  });

  it('rejects second presença transition (ag2 is already Presente via direct DB)', async () => {
    const res = await agent
      .patch(`/api/agendamentos/${ag2Id}/presenca`)
      .send({ status: 'Faltou' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/transição/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH retorno
// ─────────────────────────────────────────────────────────────────────────────

describe('PATCH /api/agendamentos/:id/retorno', () => {
  it('records return for Presente patient (ag2)', async () => {
    const res = await agent
      .patch(`/api/agendamentos/${ag2Id}/retorno`)
      .send({ status: 'Voltou no Dia' });
    expect(res.status).toBe(200);
    expect(res.body.status_retorno).toBe('Voltou no Dia');
  });

  it('rejects second retorno for ag2 (already set)', async () => {
    const res = await agent
      .patch(`/api/agendamentos/${ag2Id}/retorno`)
      .send({ status: 'Ficou em Teresina' });
    expect(res.status).toBe(400);
  });

  it('rejects retorno for ag3 (patient marked Faltou)', async () => {
    const res = await agent
      .patch(`/api/agendamentos/${ag3Id}/retorno`)
      .send({ status: 'Voltou no Dia' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Presente/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE (cancel)
// ─────────────────────────────────────────────────────────────────────────────

describe('DELETE /api/agendamentos/:id (cancel)', () => {
  let cancelId;

  beforeAll(async () => {
    // Create a fresh patient + agendamento purely for the cancel test
    const p = await criarPaciente('Cancelável Teste', '123.456.789-09', '(86) 99999-0006');
    cancelId = await criarAgendamento(viagemId, p);
    // Reset vagas to ensure capacity check passes
    db.prepare('UPDATE viagens SET vagas_ocupadas = 4 WHERE id = ?').run(viagemId);
  });

  it('cancels a future agendamento', async () => {
    const res = await agent.delete(`/api/agendamentos/${cancelId}`);
    expect(res.status).toBe(204);
  });

  it('blocks cancellation of past-trip agendamento (ag4)', async () => {
    const res = await agent.delete(`/api/agendamentos/${ag4Id}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/viagens já realizadas/i);
  });

  it('returns 404 for non-existent agendamento', async () => {
    const res = await agent.delete('/api/agendamentos/99999');
    expect(res.status).toBe(404);
  });
});
