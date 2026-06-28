const {
  calcularVagasAgendamento,
  podeCriarAgendamento,
} = require('../../src/services/agendamentoService');

describe('calcularVagasAgendamento', () => {
  test('retorna 1 quando não há acompanhante', () => {
    expect(calcularVagasAgendamento(null)).toBe(1);
  });

  test('retorna 1 quando acompanhante não ocupa vaga', () => {
    expect(calcularVagasAgendamento({ ocupa_vaga: 0 })).toBe(1);
    expect(calcularVagasAgendamento({ ocupa_vaga: false })).toBe(1);
  });

  test('retorna 2 quando acompanhante ocupa vaga', () => {
    expect(calcularVagasAgendamento({ ocupa_vaga: 1 })).toBe(2);
    expect(calcularVagasAgendamento({ ocupa_vaga: true })).toBe(2);
  });
});

describe('podeCriarAgendamento', () => {
  test('permite agendamento quando há vagas suficientes', () => {
    expect(podeCriarAgendamento(0, 1, 28)).toBe(true);
    expect(podeCriarAgendamento(26, 2, 28)).toBe(true);
  });

  test('permite agendamento exatamente no limite', () => {
    expect(podeCriarAgendamento(27, 1, 28)).toBe(true);
    expect(podeCriarAgendamento(26, 2, 28)).toBe(true);
  });

  test('impede agendamento quando excede a capacidade', () => {
    expect(podeCriarAgendamento(28, 1, 28)).toBe(false);
    expect(podeCriarAgendamento(27, 2, 28)).toBe(false);
  });

  test('impede agendamento quando viagem está exatamente cheia', () => {
    expect(podeCriarAgendamento(28, 1, 28)).toBe(false);
  });
});
