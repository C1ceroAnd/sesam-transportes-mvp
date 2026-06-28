const os = require('os');
const path = require('path');
const fs = require('fs');

const TEST_DB = path.join(os.tmpdir(), `sesam-viagens-${Date.now()}.db`);
process.env.DB_PATH = TEST_DB;

const request = require('supertest');
const bcrypt = require('bcryptjs');

let app, db, agent;

const VIAGEM_BASE = {
  data: '2030-08-15',
  motorista_id: 1,
  placa: 'ABC-1234',
  modelo_veiculo: 'Sprinter 415',
};

beforeAll(async () => {
  app = require('../../src/app');
  db = require('../../src/db');

  const hash = bcrypt.hashSync('admin123', 1);
  db.prepare("INSERT INTO usuarios (login, senha_hash) VALUES (?, ?)").run('admin', hash);
  db.prepare("INSERT INTO motoristas (id, nome) VALUES (1, 'Henrique')").run();
  db.prepare("INSERT INTO motoristas (id, nome) VALUES (2, 'Claudio')").run();

  agent = request.agent(app);
  await agent.post('/api/auth/login').send({ login: 'admin', senha: 'admin123' });
});

afterAll(() => {
  db.close();
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});

describe('POST /api/viagens', () => {
  it('creates a trip and returns 201', async () => {
    const res = await agent.post('/api/viagens').send(VIAGEM_BASE);
    expect(res.status).toBe(201);
    expect(res.body.data).toBe('2030-08-15');
    expect(res.body.vagas_ocupadas).toBe(0);
    expect(res.body.capacidade_maxima).toBe(28);
    expect(res.body.motorista.nome).toBe('Henrique');
  });

  it('returns 409 on duplicate date', async () => {
    const res = await agent.post('/api/viagens').send(VIAGEM_BASE);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/já existe uma viagem/i);
  });
});

describe('GET /api/viagens', () => {
  beforeAll(async () => {
    await agent.post('/api/viagens').send({ ...VIAGEM_BASE, data: '2030-09-01' });
    await agent.post('/api/viagens').send({ ...VIAGEM_BASE, data: '2030-09-02' });
  });

  it('returns list of all trips', async () => {
    const res = await agent.get('/api/viagens');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  it('filters trips by date', async () => {
    const res = await agent.get('/api/viagens?data=2030-09-01');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].data).toBe('2030-09-01');
  });

  it('returns empty array for date with no trips', async () => {
    const res = await agent.get('/api/viagens?data=1999-01-01');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('Capacity enforcement', () => {
  let viagemId, pacienteId;

  beforeAll(async () => {
    const v = await agent.post('/api/viagens').send({ ...VIAGEM_BASE, data: '2030-10-01' });
    viagemId = v.body.id;

    const p = await agent.post('/api/pacientes').send({
      nome: 'Teste Capacidade',
      cpf: '529.982.247-25',
      telefone: '(86) 99000-0001',
      ponto_embarque: 'SESAM',
      prioridade: 'Normal',
    });
    pacienteId = p.body.id;

    // Add companion so patient needs 2 vagas
    await agent.put(`/api/pacientes/${pacienteId}/acompanhante`).send({
      nome: 'Acompanhante',
      ocupa_vaga: true,
    });
  });

  it('blocks scheduling when trip is full', async () => {
    // Fill to 27 vagas directly (only 1 slot left, but patient+companion needs 2)
    db.prepare('UPDATE viagens SET vagas_ocupadas = 27 WHERE id = ?').run(viagemId);

    const res = await agent.post(`/api/viagens/${viagemId}/agendamentos`).send({
      paciente_id: pacienteId,
      motivo_deslocamento: 'Consulta oncológica',
      ponto_desembarque_teresina: 'H.U.',
      destino_consulta: 'HUPI Oncologia',
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/vagas/i);
  });

  it('blocks scheduling when trip is completely full (28/28)', async () => {
    db.prepare('UPDATE viagens SET vagas_ocupadas = 28 WHERE id = ?').run(viagemId);

    const res = await agent.post(`/api/viagens/${viagemId}/agendamentos`).send({
      paciente_id: pacienteId,
      motivo_deslocamento: 'Consulta oncológica',
      ponto_desembarque_teresina: 'H.U.',
      destino_consulta: 'HUPI Oncologia',
    });
    expect(res.status).toBe(409);
  });
});
