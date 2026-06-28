const PONTOS_EMBARQUE = [
  'SESAM',
  'Praça da Bandeira',
  'Sorveteria Cremosa',
  'Memorial Espedito Resende',
  'Vida Animal',
  'Posto São Francisco',
  'Posto Piripiri',
  'Posto Petrolina',
  'M. Sales',
  'ELECNOR',
  'Chico Jovem',
  'Lili Doces',
  'Entrada da Malhadinha',
  'Capela da Várzea',
];

const PONTOS_DESEMBARQUE_TERESINA = ['CEIR', 'Hospital Policial', 'H.U.', 'São Marcos'];

const STATUS_PRESENCA = ['Pendente', 'Presente', 'Faltou'];

const STATUS_RETORNO = ['Pendente', 'Voltou no Dia', 'Ficou em Teresina', 'Voltou por Conta Própria'];

function validarCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;

  return true;
}

module.exports = {
  validarCPF,
  PONTOS_EMBARQUE,
  PONTOS_DESEMBARQUE_TERESINA,
  STATUS_PRESENCA,
  STATUS_RETORNO,
};
