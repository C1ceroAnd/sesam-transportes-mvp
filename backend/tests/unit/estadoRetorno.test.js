const { validarTransicaoRetorno } = require('../../src/services/agendamentoService');

describe('validarTransicaoRetorno', () => {
  test('permite Pendente → Voltou no Dia quando Presente', () => {
    expect(() => validarTransicaoRetorno('Presente', 'Pendente', 'Voltou no Dia')).not.toThrow();
  });

  test('permite Pendente → Ficou em Teresina quando Presente', () => {
    expect(() => validarTransicaoRetorno('Presente', 'Pendente', 'Ficou em Teresina')).not.toThrow();
  });

  test('permite Pendente → Voltou por Conta Própria quando Presente', () => {
    expect(() => validarTransicaoRetorno('Presente', 'Pendente', 'Voltou por Conta Própria')).not.toThrow();
  });

  test('rejeita retorno quando paciente Faltou', () => {
    expect(() => validarTransicaoRetorno('Faltou', 'Pendente', 'Voltou no Dia')).toThrow();
  });

  test('rejeita retorno quando presença ainda Pendente', () => {
    expect(() => validarTransicaoRetorno('Pendente', 'Pendente', 'Voltou no Dia')).toThrow();
  });

  test('rejeita quando retorno já foi registrado', () => {
    expect(() => validarTransicaoRetorno('Presente', 'Voltou no Dia', 'Ficou em Teresina')).toThrow();
  });

  test('rejeita status de retorno inválido', () => {
    expect(() => validarTransicaoRetorno('Presente', 'Pendente', 'Desconhecido')).toThrow();
  });
});
