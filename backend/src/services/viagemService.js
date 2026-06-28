const db = require('../db');

// Pure helper (exported for unit testing)
function calcularSugestaoEscala(ultimaViagem, todosMotoristas) {
  if (!ultimaViagem || todosMotoristas.length <= 1) {
    return todosMotoristas[0]?.id ?? null;
  }
  const outro = todosMotoristas.find((m) => m.id !== ultimaViagem.motorista_id);
  return outro ? outro.id : todosMotoristas[0].id;
}

function formatarViagem(row, agendamentos = []) {
  return {
    id: row.id,
    data: row.data,
    motorista: { id: row.motorista_id, nome: row.motorista_nome },
    placa: row.placa,
    modelo_veiculo: row.modelo_veiculo,
    capacidade_maxima: row.capacidade_maxima,
    vagas_ocupadas: row.vagas_ocupadas,
    vagas_disponiveis: row.capacidade_maxima - row.vagas_ocupadas,
    criado_em: row.criado_em,
    agendamentos,
  };
}

const SELECT_VIAGEM = `
  SELECT v.*, m.nome AS motorista_nome
  FROM viagens v
  JOIN motoristas m ON m.id = v.motorista_id
`;

function createViagem(data) {
  const { data: dataViagem, motorista_id, placa, modelo_veiculo } = data;

  if (!dataViagem || !/^\d{4}-\d{2}-\d{2}$/.test(dataViagem)) {
    throw { code: 400, message: 'Data inválida. Use o formato YYYY-MM-DD' };
  }
  if (!motorista_id) throw { code: 400, message: 'motorista_id é obrigatório' };

  const motorista = db.prepare('SELECT * FROM motoristas WHERE id = ?').get(motorista_id);
  if (!motorista) throw { code: 400, message: 'Motorista não encontrado' };

  try {
    const result = db.prepare(
      'INSERT INTO viagens (data, motorista_id, placa, modelo_veiculo) VALUES (?, ?, ?, ?)'
    ).run(dataViagem, motorista_id, placa || null, modelo_veiculo || null);

    return getViagemById(result.lastInsertRowid);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw { code: 409, message: `Já existe uma viagem cadastrada para ${dataViagem}` };
    }
    throw err;
  }
}

function getAgendamentosDeViagem(viagemId) {
  return db.prepare(`
    SELECT
      a.id, a.viagem_id, a.motivo_deslocamento, a.ponto_desembarque_teresina,
      a.destino_consulta, a.status_presenca, a.status_retorno, a.criado_em,
      p.id AS p_id, p.nome AS p_nome, p.ponto_embarque, p.prioridade,
      ac.nome AS ac_nome, ac.ocupa_vaga AS ac_ocupa_vaga
    FROM agendamentos a
    JOIN pacientes p ON p.id = a.paciente_id
    LEFT JOIN acompanhantes ac ON ac.paciente_id = a.paciente_id
    WHERE a.viagem_id = ?
    ORDER BY p.nome
  `).all(viagemId).map((r) => ({
    id: r.id,
    paciente: { id: r.p_id, nome: r.p_nome, ponto_embarque: r.ponto_embarque, prioridade: r.prioridade },
    acompanhante: r.ac_nome ? { nome: r.ac_nome, ocupa_vaga: r.ac_ocupa_vaga === 1 } : null,
    motivo_deslocamento: r.motivo_deslocamento,
    ponto_desembarque_teresina: r.ponto_desembarque_teresina,
    destino_consulta: r.destino_consulta,
    status_presenca: r.status_presenca,
    status_retorno: r.status_retorno,
    criado_em: r.criado_em,
  }));
}

function getViagens(dateFilter) {
  let rows;
  if (dateFilter) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
      throw { code: 400, message: 'Parâmetro data inválido. Use o formato YYYY-MM-DD' };
    }
    rows = db.prepare(`${SELECT_VIAGEM} WHERE v.data = ? ORDER BY v.data DESC`).all(dateFilter);
  } else {
    rows = db.prepare(`${SELECT_VIAGEM} ORDER BY v.data DESC`).all();
  }
  return rows.map((row) => formatarViagem(row, getAgendamentosDeViagem(row.id)));
}

function getViagemById(id) {
  const row = db.prepare(`${SELECT_VIAGEM} WHERE v.id = ?`).get(id);
  if (!row) throw { code: 404, message: 'Viagem não encontrada' };
  return formatarViagem(row, getAgendamentosDeViagem(row.id));
}

function updateViagem(id, data) {
  getViagemById(id);

  const allowed = ['motorista_id', 'placa', 'modelo_veiculo'];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      if (key === 'motorista_id') {
        const m = db.prepare('SELECT id FROM motoristas WHERE id = ?').get(data[key]);
        if (!m) throw { code: 400, message: 'Motorista não encontrado' };
      }
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) throw { code: 400, message: 'Nenhum campo válido para atualizar' };

  values.push(id);
  db.prepare(`UPDATE viagens SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  const row = db.prepare(`${SELECT_VIAGEM} WHERE v.id = ?`).get(id);
  return formatarViagem(row);
}

function getSugestaoEscala() {
  const motoristas = db.prepare('SELECT id, nome FROM motoristas ORDER BY id').all();
  const ultima = db.prepare('SELECT motorista_id FROM viagens ORDER BY data DESC LIMIT 1').get();
  return {
    motoristas,
    sugestao_escala_id: calcularSugestaoEscala(ultima, motoristas),
  };
}

module.exports = {
  calcularSugestaoEscala,
  createViagem,
  getViagens,
  getViagemById,
  updateViagem,
  getSugestaoEscala,
};
