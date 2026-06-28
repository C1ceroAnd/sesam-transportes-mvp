const db = require('../db');
const { PONTOS_DESEMBARQUE_TERESINA, STATUS_RETORNO } = require('../middleware/validate');

// Pure helper functions (exported for unit testing)

function calcularVagasAgendamento(acompanhante) {
  return 1 + (acompanhante && acompanhante.ocupa_vaga ? 1 : 0);
}

function podeCriarAgendamento(vagasOcupadas, vagasNecessarias, capacidadeMaxima = 28) {
  return vagasOcupadas + vagasNecessarias <= capacidadeMaxima;
}

function validarTransicaoPresenca(statusAtual, novoStatus) {
  if (statusAtual !== 'Pendente') {
    throw { code: 400, message: `Transição de presença inválida: ${statusAtual} → ${novoStatus}` };
  }
  if (!['Presente', 'Faltou'].includes(novoStatus)) {
    throw { code: 400, message: `Status de presença inválido: ${novoStatus}` };
  }
}

function validarTransicaoRetorno(statusPresenca, statusRetornoAtual, novoStatus) {
  if (statusPresenca !== 'Presente') {
    throw { code: 400, message: 'Retorno só pode ser registrado para pacientes marcados como Presentes' };
  }
  if (statusRetornoAtual !== 'Pendente') {
    throw { code: 400, message: `Status de retorno já registrado: ${statusRetornoAtual}` };
  }
  const validos = ['Voltou no Dia', 'Ficou em Teresina', 'Voltou por Conta Própria'];
  if (!validos.includes(novoStatus)) {
    throw { code: 400, message: `Status de retorno inválido: ${novoStatus}` };
  }
}

// DB operations

function createAgendamento(viagemId, data) {
  const { paciente_id, motivo_deslocamento, ponto_desembarque_teresina, destino_consulta } = data;

  if (!paciente_id) throw { code: 400, message: 'paciente_id é obrigatório' };
  if (!motivo_deslocamento || motivo_deslocamento.length < 3) throw { code: 400, message: 'Motivo do deslocamento deve ter no mínimo 3 caracteres' };
  if (!ponto_desembarque_teresina) throw { code: 400, message: 'Ponto de desembarque em Teresina é obrigatório' };
  if (!PONTOS_DESEMBARQUE_TERESINA.includes(ponto_desembarque_teresina)) throw { code: 400, message: 'Ponto de desembarque em Teresina inválido' };
  if (!destino_consulta || destino_consulta.length < 3) throw { code: 400, message: 'Destino da consulta deve ter no mínimo 3 caracteres' };

  const viagem = db.prepare('SELECT * FROM viagens WHERE id = ?').get(viagemId);
  if (!viagem) throw { code: 404, message: 'Viagem não encontrada' };

  const paciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(paciente_id);
  if (!paciente) throw { code: 404, message: 'Paciente não encontrado' };

  const acompanhante = db.prepare('SELECT * FROM acompanhantes WHERE paciente_id = ?').get(paciente_id);
  const vagasNecessarias = calcularVagasAgendamento(acompanhante);

  const criar = db.transaction(() => {
    if (!podeCriarAgendamento(viagem.vagas_ocupadas, vagasNecessarias, viagem.capacidade_maxima)) {
      throw { code: 409, message: `Viagem sem vagas disponíveis (${viagem.vagas_ocupadas}/${viagem.capacidade_maxima})` };
    }

    try {
      const result = db.prepare(`
        INSERT INTO agendamentos
          (viagem_id, paciente_id, motivo_deslocamento, ponto_desembarque_teresina, destino_consulta)
        VALUES (?, ?, ?, ?, ?)
      `).run(viagemId, paciente_id, motivo_deslocamento, ponto_desembarque_teresina, destino_consulta);

      db.prepare('UPDATE viagens SET vagas_ocupadas = vagas_ocupadas + ? WHERE id = ?')
        .run(vagasNecessarias, viagemId);

      return result.lastInsertRowid;
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw { code: 409, message: 'Paciente já agendado nesta viagem' };
      }
      throw err;
    }
  });

  const agendamentoId = criar();

  const agendamento = db.prepare(`
    SELECT a.*, p.nome AS p_nome, p.ponto_embarque, p.prioridade,
           ac.nome AS ac_nome, ac.ocupa_vaga
    FROM agendamentos a
    JOIN pacientes p ON p.id = a.paciente_id
    LEFT JOIN acompanhantes ac ON ac.paciente_id = a.paciente_id
    WHERE a.id = ?
  `).get(agendamentoId);

  return {
    id: agendamento.id,
    viagem_id: agendamento.viagem_id,
    paciente: { id: paciente.id, nome: agendamento.p_nome, ponto_embarque: agendamento.ponto_embarque, prioridade: agendamento.prioridade },
    acompanhante: agendamento.ac_nome ? { nome: agendamento.ac_nome, ocupa_vaga: agendamento.ocupa_vaga === 1 } : null,
    motivo_deslocamento: agendamento.motivo_deslocamento,
    ponto_desembarque_teresina: agendamento.ponto_desembarque_teresina,
    destino_consulta: agendamento.destino_consulta,
    status_presenca: agendamento.status_presenca,
    status_retorno: agendamento.status_retorno,
    vagas_consumidas: vagasNecessarias,
    criado_em: agendamento.criado_em,
  };
}

function cancelAgendamento(id) {
  const agendamento = db.prepare('SELECT a.*, v.data FROM agendamentos a JOIN viagens v ON v.id = a.viagem_id WHERE a.id = ?').get(id);
  if (!agendamento) throw { code: 404, message: 'Agendamento não encontrado' };

  const hoje = new Date().toISOString().slice(0, 10);
  if (agendamento.data < hoje) {
    throw { code: 400, message: 'Não é possível cancelar agendamentos de viagens já realizadas' };
  }

  const acompanhante = db.prepare('SELECT * FROM acompanhantes WHERE paciente_id = ?').get(agendamento.paciente_id);
  const vagasLiberadas = calcularVagasAgendamento(acompanhante);

  db.transaction(() => {
    db.prepare('DELETE FROM agendamentos WHERE id = ?').run(id);
    db.prepare('UPDATE viagens SET vagas_ocupadas = vagas_ocupadas - ? WHERE id = ?')
      .run(vagasLiberadas, agendamento.viagem_id);
  })();
}

function updatePresenca(id, novoStatus) {
  const agendamento = db.prepare('SELECT * FROM agendamentos WHERE id = ?').get(id);
  if (!agendamento) throw { code: 404, message: 'Agendamento não encontrado' };

  validarTransicaoPresenca(agendamento.status_presenca, novoStatus);

  db.prepare('UPDATE agendamentos SET status_presenca = ? WHERE id = ?').run(novoStatus, id);
  return { id, status_presenca: novoStatus };
}

function updateRetorno(id, novoStatus) {
  const agendamento = db.prepare('SELECT * FROM agendamentos WHERE id = ?').get(id);
  if (!agendamento) throw { code: 404, message: 'Agendamento não encontrado' };

  validarTransicaoRetorno(agendamento.status_presenca, agendamento.status_retorno, novoStatus);

  db.prepare('UPDATE agendamentos SET status_retorno = ? WHERE id = ?').run(novoStatus, id);
  return { id, status_retorno: novoStatus };
}

module.exports = {
  calcularVagasAgendamento,
  podeCriarAgendamento,
  validarTransicaoPresenca,
  validarTransicaoRetorno,
  createAgendamento,
  cancelAgendamento,
  updatePresenca,
  updateRetorno,
};
