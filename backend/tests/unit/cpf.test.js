const { validarCPF } = require('../../src/middleware/validate');

describe('validarCPF', () => {
  test('aceita CPF válido formatado', () => {
    expect(validarCPF('529.982.247-25')).toBe(true);
  });

  test('aceita CPF válido sem formatação', () => {
    expect(validarCPF('52998224725')).toBe(true);
  });

  test('rejeita CPF com dígitos verificadores errados', () => {
    expect(validarCPF('529.982.247-26')).toBe(false);
  });

  test('rejeita CPF com todos os dígitos iguais (111.111.111-11)', () => {
    expect(validarCPF('111.111.111-11')).toBe(false);
  });

  test('rejeita CPF com todos os dígitos iguais (000.000.000-00)', () => {
    expect(validarCPF('000.000.000-00')).toBe(false);
  });

  test('rejeita CPF com comprimento incorreto', () => {
    expect(validarCPF('123.456.789')).toBe(false);
  });

  test('rejeita CPF com apenas letras', () => {
    expect(validarCPF('abc.def.ghi-jk')).toBe(false);
  });

  test('aceita segundo CPF válido', () => {
    expect(validarCPF('123.456.789-09')).toBe(true);
  });
});
