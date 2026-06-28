const { validarTransicaoPresenca } = require('../../src/services/agendamentoService');

describe('validarTransicaoPresenca', () => {
  test('permite Pendente → Presente', () => {
    expect(() => validarTransicaoPresenca('Pendente', 'Presente')).not.toThrow();
  });

  test('permite Pendente → Faltou', () => {
    expect(() => validarTransicaoPresenca('Pendente', 'Faltou')).not.toThrow();
  });

  test('rejeita Presente → Pendente', () => {
    expect(() => validarTransicaoPresenca('Presente', 'Pendente')).toThrow();
  });

  test('rejeita Faltou → Pendente', () => {
    expect(() => validarTransicaoPresenca('Faltou', 'Pendente')).toThrow();
  });

  test('rejeita Faltou → Presente', () => {
    expect(() => validarTransicaoPresenca('Faltou', 'Presente')).toThrow();
  });

  test('rejeita Presente → Faltou', () => {
    expect(() => validarTransicaoPresenca('Presente', 'Faltou')).toThrow();
  });

  test('rejeita status inválido', () => {
    expect(() => validarTransicaoPresenca('Pendente', 'Ausente')).toThrow();
  });
});
