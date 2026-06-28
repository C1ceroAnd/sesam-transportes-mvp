const { calcularSugestaoEscala } = require('../../src/services/viagemService');

describe('calcularSugestaoEscala', () => {
  test('sugere motorista 1 quando não há viagem anterior', () => {
    expect(calcularSugestaoEscala(null, [{ id: 1 }, { id: 2 }])).toBe(1);
  });

  test('sugere motorista 2 quando última viagem usou motorista 1', () => {
    expect(calcularSugestaoEscala({ motorista_id: 1 }, [{ id: 1 }, { id: 2 }])).toBe(2);
  });

  test('sugere motorista 1 quando última viagem usou motorista 2', () => {
    expect(calcularSugestaoEscala({ motorista_id: 2 }, [{ id: 1 }, { id: 2 }])).toBe(1);
  });

  test('retorna o id do único motorista disponível quando não há alternativa', () => {
    expect(calcularSugestaoEscala({ motorista_id: 1 }, [{ id: 1 }])).toBe(1);
  });

  test('alterna corretamente independentemente da ordem da lista', () => {
    expect(calcularSugestaoEscala({ motorista_id: 2 }, [{ id: 2 }, { id: 1 }])).toBe(1);
  });
});
