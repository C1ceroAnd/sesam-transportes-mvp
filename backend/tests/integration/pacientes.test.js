const os = require('os');
const path = require('path');
const fs = require('fs');

const TEST_DB = path.join(os.tmpdir(), `sesam-pacientes-${Date.now()}.db`);
process.env.DB_PATH = TEST_DB;

const request = require('supertest');
const bcrypt = require('bcryptjs');

let app, db, agent;

beforeAll(async () => {
  app = require('../../src/app');
  db = require('../../src/db');

  const hash = bcrypt.hashSync('admin123', 1);
  db.prepare("INSERT INTO usuarios (login, senha_hash) VALUES (?, ?)").run('admin', hash);
  db.prepare("INSERT INTO motoristas (id, nome) VALUES (1, 'Henrique')").run();
  db.prepare("INSERT INTO motoristas (id, nome) VALUES (2, 'Claudio')").run();

  agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ login: 'admin', senha: 'admin123' });
  expect(res.status).toBe(200);
});

afterAll(() => {
  db.close();
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});

const VALID_PACIENTE = {
  nome: 'Maria da Silva',
  cpf: '529.982.247-25',
  telefone: '(86) 99999-0001',
  ponto_embarque: 'SESAM',
  prioridade: 'Normal',
};

describe('POST /api/pacientes', () => {
  it('creates a patient and returns 201', async () => {
    const res = await agent.post('/api/pacientes').send(VALID_PACIENTE);
    expect(res.status).toBe(201);
    expect(res.body.nome).toBe('Maria da Silva');
    expect(res.body.cpf).toBe('529.982.247-25');
    expect(res.body.id).toBeDefined();
  });

  it('returns 409 on duplicate CPF', async () => {
    const res = await agent.post('/api/pacientes').send(VALID_PACIENTE);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/CPF já cadastrado/i);
  });

  it('returns 400 on invalid CPF', async () => {
    const res = await agent.post('/api/pacientes').send({ ...VALID_PACIENTE, cpf: '111.111.111-11' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/CPF inválido/i);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/pacientes').send(VALID_PACIENTE);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/pacientes', () => {
  it('returns a list of all patients', async () => {
    const res = await agent.get('/api/pacientes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('searches patients by name via ?q=', async () => {
    const res = await agent.get('/api/pacientes?q=Maria');
    expect(res.status).toBe(200);
    expect(res.body.some((p) => p.nome.includes('Maria'))).toBe(true);
  });

  it('returns empty array for unknown search term', async () => {
    const res = await agent.get('/api/pacientes?q=XYZ_INEXISTENTE_999');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('PUT /api/pacientes/:id', () => {
  let pacienteId;

  beforeAll(async () => {
    const res = await agent.get('/api/pacientes');
    pacienteId = res.body[0].id;
  });

  it('updates patient fields', async () => {
    const res = await agent.put(`/api/pacientes/${pacienteId}`).send({
      nome: 'Maria S. Atualizada',
      telefone: '(86) 88888-0001',
      ponto_embarque: 'SESAM',
      prioridade: 'Alta',
    });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Maria S. Atualizada');
    expect(res.body.prioridade).toBe('Alta');
  });

  it('returns 404 for unknown patient', async () => {
    const res = await agent.put('/api/pacientes/99999').send({ nome: 'X', telefone: '1', ponto_embarque: 'SESAM', prioridade: 'Normal' });
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/pacientes/:id/acompanhante', () => {
  let pacienteId;

  beforeAll(async () => {
    const res = await agent.get('/api/pacientes');
    pacienteId = res.body[0].id;
  });

  it('upserts companion', async () => {
    const res = await agent.put(`/api/pacientes/${pacienteId}/acompanhante`).send({
      nome: 'João da Silva',
      ocupa_vaga: true,
    });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('João da Silva');
    expect(res.body.ocupa_vaga).toBe(true);
  });

  it('updates existing companion', async () => {
    const res = await agent.put(`/api/pacientes/${pacienteId}/acompanhante`).send({
      nome: 'Ana da Silva',
      ocupa_vaga: false,
    });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Ana da Silva');
    expect(res.body.ocupa_vaga).toBe(false);
  });
});
