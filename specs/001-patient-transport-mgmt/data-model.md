# Data Model: Gerenciamento de Transporte de Pacientes SESAM

**Feature**: 001-patient-transport-mgmt
**Date**: 2026-06-27

---

## Entities

### Paciente

Pessoa que recebe o serviço de transporte.

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | INTEGER PK autoincrement | Gerado pelo sistema |
| `nome` | TEXT NOT NULL | Mínimo 3 caracteres |
| `cpf` | TEXT NOT NULL UNIQUE | Formato XXX.XXX.XXX-XX; algoritmo de dígitos verificadores; único no sistema |
| `telefone` | TEXT NOT NULL | Mínimo 10 dígitos (com DDD) |
| `ponto_embarque` | TEXT NOT NULL | Deve pertencer à lista fixa de 14 pontos |
| `prioridade` | TEXT NOT NULL DEFAULT 'Normal' | Valores aceitos: `Alta`, `Normal` |
| `criado_em` | DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP | Imutável após criação |

**Regras de negócio**:
- CPF não pode ser alterado após o cadastro. Para mudança de CPF, criar novo registro.
- `ponto_embarque` é validado contra a lista fixa no momento da escrita (não apenas na UI).

**Lista fixa de pontos de embarque**:
`SESAM`, `Praça da Bandeira`, `Sorveteria Cremosa`, `Memorial Espedito Resende`, `Vida Animal`, `Posto São Francisco`, `Posto Piripiri`, `Posto Petrolina`, `M. Sales`, `ELECNOR`, `Chico Jovem`, `Lili Doces`, `Entrada da Malhadinha`, `Capela da Várzea`

---

### Acompanhante

Pessoa vinculada a um Paciente específico. Máximo um acompanhante por paciente.

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | INTEGER PK autoincrement | Gerado pelo sistema |
| `paciente_id` | INTEGER NOT NULL FK → Paciente | Cascade delete se o paciente for deletado |
| `nome` | TEXT NOT NULL | Mínimo 3 caracteres |
| `ocupa_vaga` | INTEGER NOT NULL DEFAULT 1 | Booleano: 1 = ocupa vaga, 0 = não ocupa |

**Regras de negócio**:
- Existe no máximo 1 acompanhante por paciente (constraint UNIQUE em `paciente_id`).
- A flag `ocupa_vaga` determina se o acompanhante é contado nas 28 vagas da viagem.

---

### Motorista

Condutor do veículo. O MVP opera com exatamente 2 motoristas cadastrados.

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | INTEGER PK autoincrement | Gerado pelo sistema |
| `nome` | TEXT NOT NULL | Mínimo 3 caracteres |

**Regras de negócio**:
- Os 2 motoristas são cadastrados via seed/setup inicial. Não há UI de cadastro de motoristas no MVP.

---

### Viagem

Evento de transporte para uma data específica. Uma viagem por dia.

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | INTEGER PK autoincrement | Gerado pelo sistema |
| `data` | DATE NOT NULL UNIQUE | Formato ISO 8601 (YYYY-MM-DD); único — uma viagem por dia |
| `motorista_id` | INTEGER NOT NULL FK → Motorista | Deve ser um motorista cadastrado |
| `placa` | TEXT | Formato livre; pode ser registrado depois |
| `modelo_veiculo` | TEXT | Formato livre; pode ser registrado depois |
| `capacidade_maxima` | INTEGER NOT NULL DEFAULT 28 | Constante no MVP |
| `vagas_ocupadas` | INTEGER NOT NULL DEFAULT 0 | Calculado: soma de agendamentos ativos (paciente + acompanhantes com ocupa_vaga=1) |
| `criado_em` | DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP | Imutável |

**Regras de negócio**:
- `vagas_ocupadas` é mantido consistente pelo sistema a cada criação/cancelamento de agendamento (atualizado transacionalmente).
- Uma viagem é considerada "realizada" se sua `data` < data atual. Operações de cancelamento são bloqueadas em viagens realizadas.
- `vagas_ocupadas` nunca pode superar `capacidade_maxima`. Tentativa de agendamento que excederia o limite é rejeitada com erro de negócio.

---

### Agendamento

Vínculo entre um Paciente e uma Viagem, com todos os dados operacionais do transporte.

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | INTEGER PK autoincrement | Gerado pelo sistema |
| `viagem_id` | INTEGER NOT NULL FK → Viagem | |
| `paciente_id` | INTEGER NOT NULL FK → Paciente | |
| `motivo_deslocamento` | TEXT NOT NULL | Texto livre; mínimo 3 caracteres |
| `ponto_desembarque_teresina` | TEXT NOT NULL | Deve pertencer à lista fixa de 4 destinos |
| `destino_consulta` | TEXT NOT NULL | Texto livre; mínimo 3 caracteres |
| `status_presenca` | TEXT NOT NULL DEFAULT 'Pendente' | Máquina de estados — ver abaixo |
| `status_retorno` | TEXT NOT NULL DEFAULT 'Pendente' | Máquina de estados — ver abaixo |
| `criado_em` | DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP | Imutável |

**Constraint UNIQUE**: (`viagem_id`, `paciente_id`) — um paciente não pode ter dois agendamentos na mesma viagem.

**Lista fixa de pontos de desembarque em Teresina**:
`CEIR`, `Hospital Policial`, `H.U.`, `São Marcos`

---

## State Machines

### Agendamento.status_presenca

```
            [criação]
                │
                ▼
           ┌─────────┐
           │ Pendente │
           └────┬────┘
                │  (administrativo lança presença/falta)
       ┌────────┴────────┐
       ▼                 ▼
  ┌─────────┐      ┌──────────┐
  │Presente │      │  Faltou  │
  └─────────┘      └──────────┘
```

- Transições permitidas: `Pendente → Presente`, `Pendente → Faltou`
- Transições proibidas: reversão de `Presente` ou `Faltou` de volta a `Pendente` (estado final)
- `Faltou` bloqueia o preenchimento de `status_retorno`

### Agendamento.status_retorno

```
            [criação / após Faltou]
                │
                ▼
           ┌─────────┐
           │ Pendente │  ← só transitável se status_presenca = Presente
           └────┬────┘
                │  (administrativo lança retorno)
       ┌────────┼──────────────┐
       ▼        ▼              ▼
  ┌──────────┐ ┌─────────────┐ ┌────────────────────────┐
  │Voltou no │ │Ficou em     │ │Voltou por Conta Própria│
  │   Dia    │ │  Teresina   │ └────────────────────────┘
  └──────────┘ └─────────────┘
```

- Transições permitidas: `Pendente → Voltou no Dia`, `Pendente → Ficou em Teresina`, `Pendente → Voltou por Conta Própria`
- Pré-condição: `status_presenca` deve ser `Presente`. Se `Faltou`, o status de retorno permanece `Pendente` e não pode ser alterado.

---

## Relationships

```
Paciente ──── 0..1 ──── Acompanhante
    │
    └──── 0..* ──── Agendamento ──── *..1 ──── Viagem
                                                   │
                                              *..1 ──── Motorista
```

---

## Capacity Calculation

```
vagas_ocupadas_por_agendamento = 1 (paciente)
  + (1 if acompanhante exists AND ocupa_vaga = 1 else 0)

viagem.vagas_ocupadas = SUM(vagas por agendamento ativo)
viagem.vagas_disponiveis = capacidade_maxima - vagas_ocupadas

Agendamento só é criado se: vagas_disponiveis >= vagas_necessárias_do_agendamento
```

---

## Seed Data

```sql
-- Motoristas (inseridos via seed inicial)
INSERT INTO motoristas (nome) VALUES ('Henrique');
INSERT INTO motoristas (nome) VALUES ('Claudio');

-- Usuário admin (senha hasheada via bcrypt)
INSERT INTO usuarios (login, senha_hash) VALUES ('admin', '<bcrypt_hash>');
```
