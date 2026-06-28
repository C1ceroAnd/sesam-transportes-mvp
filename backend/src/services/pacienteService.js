const db = require('../db');
const { validarCPF, PONTOS_EMBARQUE } = require('../middleware/validate');

function formatarAcompanhante(row) {
  if (!row || row.acomp_id == null) return null;
  return {
    id: row.acomp_id,
    nome: row.acomp_nome,
    ocupa_vaga: row.acomp_ocupa_vaga === 1,
  };
}

function rowToPaciente(row) {
  return {
    id: row.id,
    nome: row.nome,
    cpf: row.cpf,
    telefone: row.telefone,
    ponto_embarque: row.ponto_embarque,
    prioridade: row.prioridade,
    criado_em: row.criado_em,
    acompanhante: formatarAcompanhante(row),
  };
}

const SELECT_PACIENTE = `
  SELECT
    p.id, p.nome, p.cpf, p.telefone, p.ponto_embarque, p.prioridade, p.criado_em,
    a.id    AS acomp_id,
    a.nome  AS acomp_nome,
    a.ocupa_vaga AS acomp_ocupa_vaga
  FROM pacientes p
  LEFT JOIN acompanhantes a ON a.paciente_id = p.id
`;

function createPaciente(data) {
  const { nome, cpf, telefone, ponto_embarque, prioridade = 'Normal' } = data;

  if (!nome || nome.length < 3) throw { code: 400, message: 'Nome deve ter no mínimo 3 caracteres' };
  if (!cpf) throw { code: 400, message: 'CPF é obrigatório' };
  if (!validarCPF(cpf)) throw { code: 400, message: 'CPF inválido' };
  if (!telefone) throw { code: 400, message: 'Telefone é obrigatório' };
  if (!ponto_embarque) throw { code: 400, message: 'Ponto de embarque é obrigatório' };
  if (!PONTOS_EMBARQUE.includes(ponto_embarque)) throw { code: 400, message: 'Ponto de embarque inválido' };
  if (!['Alta', 'Normal'].includes(prioridade)) throw { code: 400, message: 'Prioridade inválida' };

  try {
    const result = db.prepare(
      'INSERT INTO pacientes (nome, cpf, telefone, ponto_embarque, prioridade) VALUES (?, ?, ?, ?, ?)'
    ).run(nome, cpf, telefone, ponto_embarque, prioridade);

    return getPacienteById(result.lastInsertRowid);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') throw { code: 409, message: 'CPF já cadastrado no sistema' };
    throw err;
  }
}

function getPacientes(q) {
  if (q) {
    const like = `%${q}%`;
    const rows = db.prepare(`${SELECT_PACIENTE} WHERE p.nome LIKE ? OR p.cpf LIKE ? ORDER BY p.nome`).all(like, like);
    return rows.map(rowToPaciente);
  }
  const rows = db.prepare(`${SELECT_PACIENTE} ORDER BY p.nome`).all();
  return rows.map(rowToPaciente);
}

function getPacienteById(id) {
  const row = db.prepare(`${SELECT_PACIENTE} WHERE p.id = ?`).get(id);
  if (!row) throw { code: 404, message: 'Paciente não encontrado' };
  return rowToPaciente(row);
}

function updatePaciente(id, data) {
  getPacienteById(id);

  const allowed = ['nome', 'telefone', 'ponto_embarque', 'prioridade'];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      if (key === 'nome' && data[key].length < 3) throw { code: 400, message: 'Nome deve ter no mínimo 3 caracteres' };
      if (key === 'ponto_embarque' && !PONTOS_EMBARQUE.includes(data[key])) throw { code: 400, message: 'Ponto de embarque inválido' };
      if (key === 'prioridade' && !['Alta', 'Normal'].includes(data[key])) throw { code: 400, message: 'Prioridade inválida' };
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) throw { code: 400, message: 'Nenhum campo válido para atualizar' };

  values.push(id);
  db.prepare(`UPDATE pacientes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getPacienteById(id);
}

function upsertAcompanhante(pacienteId, data) {
  getPacienteById(pacienteId);

  const { nome, ocupa_vaga } = data;
  if (!nome || nome.length < 3) throw { code: 400, message: 'Nome do acompanhante deve ter no mínimo 3 caracteres' };

  const ocupaVagaVal = ocupa_vaga ? 1 : 0;

  db.prepare(`
    INSERT INTO acompanhantes (paciente_id, nome, ocupa_vaga)
    VALUES (?, ?, ?)
    ON CONFLICT(paciente_id) DO UPDATE SET nome = excluded.nome, ocupa_vaga = excluded.ocupa_vaga
  `).run(pacienteId, nome, ocupaVagaVal);

  const row = db.prepare('SELECT * FROM acompanhantes WHERE paciente_id = ?').get(pacienteId);
  return {
    id: row.id,
    paciente_id: row.paciente_id,
    nome: row.nome,
    ocupa_vaga: row.ocupa_vaga === 1,
  };
}

function deleteAcompanhante(pacienteId) {
  getPacienteById(pacienteId);
  const result = db.prepare('DELETE FROM acompanhantes WHERE paciente_id = ?').run(pacienteId);
  if (result.changes === 0) throw { code: 404, message: 'Acompanhante não encontrado' };
}

module.exports = {
  createPaciente,
  getPacientes,
  getPacienteById,
  updatePaciente,
  upsertAcompanhante,
  deleteAcompanhante,
};
