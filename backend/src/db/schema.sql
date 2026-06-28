CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS motoristas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pacientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL CHECK(length(nome) >= 3),
  cpf TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  ponto_embarque TEXT NOT NULL,
  prioridade TEXT NOT NULL DEFAULT 'Normal' CHECK(prioridade IN ('Alta', 'Normal')),
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS acompanhantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER NOT NULL UNIQUE REFERENCES pacientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL CHECK(length(nome) >= 3),
  ocupa_vaga INTEGER NOT NULL DEFAULT 1 CHECK(ocupa_vaga IN (0, 1))
);

CREATE TABLE IF NOT EXISTS viagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data DATE NOT NULL UNIQUE,
  motorista_id INTEGER NOT NULL REFERENCES motoristas(id),
  placa TEXT,
  modelo_veiculo TEXT,
  capacidade_maxima INTEGER NOT NULL DEFAULT 28,
  vagas_ocupadas INTEGER NOT NULL DEFAULT 0 CHECK(vagas_ocupadas >= 0),
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  viagem_id INTEGER NOT NULL REFERENCES viagens(id),
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
  motivo_deslocamento TEXT NOT NULL CHECK(length(motivo_deslocamento) >= 3),
  ponto_desembarque_teresina TEXT NOT NULL,
  destino_consulta TEXT NOT NULL CHECK(length(destino_consulta) >= 3),
  status_presenca TEXT NOT NULL DEFAULT 'Pendente' CHECK(status_presenca IN ('Pendente', 'Presente', 'Faltou')),
  status_retorno TEXT NOT NULL DEFAULT 'Pendente' CHECK(status_retorno IN ('Pendente', 'Voltou no Dia', 'Ficou em Teresina', 'Voltou por Conta Própria')),
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(viagem_id, paciente_id)
);
