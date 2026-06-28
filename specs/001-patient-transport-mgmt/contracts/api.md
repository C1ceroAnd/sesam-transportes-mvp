# API Contracts: Gerenciamento de Transporte de Pacientes SESAM

**Feature**: 001-patient-transport-mgmt
**Style**: REST over HTTP/JSON
**Base URL**: `/api`
**Auth**: Session cookie (`connect.sid`). Todas as rotas exceto `/api/auth/login` exigem sessão ativa. Requisições sem sessão retornam `401`.

---

## Convenções

- Datas: ISO 8601 string (`YYYY-MM-DD` para datas, `YYYY-MM-DDTHH:MM:SSZ` para datetimes)
- Erros: `{ "error": "<mensagem legível>" }`
- Sucesso sem corpo: HTTP 204 No Content
- IDs: inteiros positivos

---

## Autenticação

### POST /api/auth/login

Autentica o usuário administrador e cria sessão.

**Request**
```json
{
  "login": "admin",
  "senha": "string"
}
```

**Response 200**
```json
{ "ok": true }
```

**Response 401**
```json
{ "error": "Credenciais inválidas" }
```

---

### POST /api/auth/logout

Encerra a sessão ativa.

**Response**: 204

---

## Pacientes

### POST /api/pacientes

Cadastra um novo paciente.

**Request**
```json
{
  "nome": "string (min 3 chars)",
  "cpf": "string (formato XXX.XXX.XXX-XX, dígitos verificadores válidos, único)",
  "telefone": "string (min 10 dígitos com DDD)",
  "ponto_embarque": "string (valor da lista fixa)",
  "prioridade": "Alta | Normal"
}
```

**Response 201**
```json
{
  "id": 1,
  "nome": "Maria da Silva",
  "cpf": "123.456.789-09",
  "telefone": "(86) 99999-9999",
  "ponto_embarque": "SESAM",
  "prioridade": "Normal",
  "acompanhante": null,
  "criado_em": "2026-06-27T10:00:00Z"
}
```

**Response 400** — validação falhou (CPF inválido, ponto_embarque fora da lista, campo obrigatório faltando)
```json
{ "error": "CPF inválido" }
```

**Response 409** — CPF já cadastrado
```json
{ "error": "CPF já cadastrado no sistema" }
```

---

### GET /api/pacientes

Lista todos os pacientes (inclui acompanhante se houver).

**Query params**: `q` (opcional) — busca por nome ou CPF (substring case-insensitive)

**Response 200**
```json
[
  {
    "id": 1,
    "nome": "Maria da Silva",
    "cpf": "123.456.789-09",
    "telefone": "(86) 99999-9999",
    "ponto_embarque": "SESAM",
    "prioridade": "Normal",
    "acompanhante": {
      "id": 1,
      "nome": "João da Silva",
      "ocupa_vaga": true
    }
  }
]
```

---

### GET /api/pacientes/:id

Retorna um paciente específico com acompanhante.

**Response 200** — mesmo schema do item acima
**Response 404** `{ "error": "Paciente não encontrado" }`

---

### PUT /api/pacientes/:id

Atualiza dados do paciente. CPF não pode ser alterado.

**Request** — campos opcionais (apenas os enviados são atualizados)
```json
{
  "nome": "string",
  "telefone": "string",
  "ponto_embarque": "string",
  "prioridade": "Alta | Normal"
}
```

**Response 200** — paciente atualizado (mesmo schema do GET)
**Response 400** — campo inválido
**Response 404** — paciente não encontrado

---

### PUT /api/pacientes/:id/acompanhante

Cria ou atualiza o acompanhante do paciente (upsert).

**Request**
```json
{
  "nome": "string (min 3 chars)",
  "ocupa_vaga": true
}
```

**Response 200**
```json
{
  "id": 1,
  "paciente_id": 1,
  "nome": "João da Silva",
  "ocupa_vaga": true
}
```

**Response 400** — validação falhou
**Response 404** — paciente não encontrado

---

### DELETE /api/pacientes/:id/acompanhante

Remove o acompanhante do paciente.

**Response**: 204
**Response 404** — paciente ou acompanhante não encontrado

---

## Motoristas

### GET /api/motoristas

Lista os motoristas cadastrados (exatamente 2 no MVP) com sugestão de escala.

**Response 200**
```json
{
  "motoristas": [
    { "id": 1, "nome": "Motorista 1" },
    { "id": 2, "nome": "Motorista 2" }
  ],
  "sugestao_escala_id": 2
}
```

`sugestao_escala_id`: ID do motorista sugerido para a próxima viagem (alternância baseada na última viagem registrada). `null` se não houver viagem anterior (padrão: motorista id 1).

---

## Viagens

### POST /api/viagens

Cria uma nova viagem.

**Request**
```json
{
  "data": "2026-07-01",
  "motorista_id": 1,
  "placa": "ABC-1234",
  "modelo_veiculo": "Micro-ônibus Sprinter"
}
```

`placa` e `modelo_veiculo` são opcionais na criação (podem ser registrados via PUT depois).

**Response 201**
```json
{
  "id": 10,
  "data": "2026-07-01",
  "motorista": { "id": 1, "nome": "Motorista 1" },
  "placa": "ABC-1234",
  "modelo_veiculo": "Micro-ônibus Sprinter",
  "capacidade_maxima": 28,
  "vagas_ocupadas": 0,
  "vagas_disponiveis": 28,
  "criado_em": "2026-06-27T10:00:00Z"
}
```

**Response 400** — data inválida, motorista_id inválido
**Response 409** — já existe viagem para essa data
```json
{ "error": "Já existe uma viagem cadastrada para 2026-07-01" }
```

---

### GET /api/viagens

Lista viagens com filtro por data.

**Query params**: `data` (opcional, formato `YYYY-MM-DD`) — sem filtro retorna todas as viagens ordenadas por data desc

**Response 200**
```json
[
  {
    "id": 10,
    "data": "2026-07-01",
    "motorista": { "id": 1, "nome": "Motorista 1" },
    "placa": "ABC-1234",
    "modelo_veiculo": "Micro-ônibus Sprinter",
    "capacidade_maxima": 28,
    "vagas_ocupadas": 5,
    "vagas_disponiveis": 23,
    "agendamentos": [
      {
        "id": 20,
        "paciente": {
          "id": 1,
          "nome": "Maria da Silva",
          "ponto_embarque": "SESAM",
          "prioridade": "Normal"
        },
        "acompanhante": { "nome": "João da Silva", "ocupa_vaga": true },
        "motivo_deslocamento": "Consulta oncológica",
        "ponto_desembarque_teresina": "H.U.",
        "destino_consulta": "HUPI - Oncologia",
        "status_presenca": "Presente",
        "status_retorno": "Voltou no Dia"
      }
    ]
  }
]
```

**Response 400** — parâmetro `data` em formato inválido

---

### GET /api/viagens/:id

Retorna uma viagem específica com todos os agendamentos.

**Response 200** — mesmo schema do item de GET /api/viagens
**Response 404** `{ "error": "Viagem não encontrada" }`

---

### PUT /api/viagens/:id

Atualiza motorista, placa ou modelo do veículo de uma viagem.

**Request** — campos opcionais
```json
{
  "motorista_id": 2,
  "placa": "XYZ-9876",
  "modelo_veiculo": "Sprinter 415"
}
```

**Response 200** — viagem atualizada (sem lista de agendamentos)
**Response 400** — campo inválido
**Response 404** — viagem não encontrada

---

## Agendamentos

### POST /api/viagens/:viagem_id/agendamentos

Agenda um paciente em uma viagem.

**Request**
```json
{
  "paciente_id": 1,
  "motivo_deslocamento": "Consulta oncológica",
  "ponto_desembarque_teresina": "H.U.",
  "destino_consulta": "HUPI - Oncologia"
}
```

**Response 201**
```json
{
  "id": 20,
  "viagem_id": 10,
  "paciente": {
    "id": 1,
    "nome": "Maria da Silva",
    "ponto_embarque": "SESAM",
    "prioridade": "Normal"
  },
  "acompanhante": { "nome": "João da Silva", "ocupa_vaga": true },
  "motivo_deslocamento": "Consulta oncológica",
  "ponto_desembarque_teresina": "H.U.",
  "destino_consulta": "HUPI - Oncologia",
  "status_presenca": "Pendente",
  "status_retorno": "Pendente",
  "vagas_consumidas": 2,
  "criado_em": "2026-06-27T10:05:00Z"
}
```

**Response 400**
- `ponto_desembarque_teresina` fora da lista fixa
- campos obrigatórios ausentes

**Response 404** — viagem ou paciente não encontrado

**Response 409**
- Capacidade máxima atingida: `{ "error": "Viagem sem vagas disponíveis (28/28)" }`
- Paciente já agendado nesta viagem: `{ "error": "Paciente já agendado nesta viagem" }`

---

### DELETE /api/agendamentos/:id

Cancela um agendamento, liberando as vagas.

**Response**: 204

**Response 400** — viagem já realizada (data < hoje)
```json
{ "error": "Não é possível cancelar agendamentos de viagens já realizadas" }
```

**Response 404** — agendamento não encontrado

---

### PATCH /api/agendamentos/:id/presenca

Registra presença ou falta do paciente na viagem.

**Request**
```json
{
  "status": "Presente | Faltou"
}
```

**Response 200**
```json
{
  "id": 20,
  "status_presenca": "Presente"
}
```

**Response 400** — valor de status inválido ou tentativa de reversão de estado final
**Response 404** — agendamento não encontrado

---

### PATCH /api/agendamentos/:id/retorno

Registra o status de retorno do paciente.

**Request**
```json
{
  "status": "Voltou no Dia | Ficou em Teresina | Voltou por Conta Própria"
}
```

**Response 200**
```json
{
  "id": 20,
  "status_retorno": "Voltou no Dia"
}
```

**Response 400**
- valor de status inválido
- tentativa de registrar retorno com `status_presenca` diferente de `Presente`: `{ "error": "Retorno só pode ser registrado para pacientes marcados como Presentes" }`

**Response 404** — agendamento não encontrado

---

## Relatório

### GET /api/pacientes/:id/relatorio

Gera e retorna o relatório PDF com o histórico de viagens do paciente.

**Response 200**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="relatorio-<nome>-<data>.pdf"`
- Corpo: bytes do PDF

**Response 404** — paciente não encontrado
**Response 204** — paciente não tem agendamentos registrados (PDF não gerado)
