# SESAM Transportes — Sistema de Gerenciamento de Transporte de Pacientes

![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/Licença-MIT-green)
![Status](https://img.shields.io/badge/Status-MVP%20Completo-blue)

Sistema web administrativo desenvolvido para a **SESAM** (Secretaria de Saúde Municipal) para gerenciar o transporte diário de pacientes até Teresina para consultas médicas. Permite cadastrar pacientes, criar viagens, controlar agendamentos com validação de capacidade (28 vagas), registrar presença e status de retorno, e gerar relatórios PDF por paciente.

---

## Visão Geral do Sistema

O sistema é dividido em duas telas principais:

**Pacientes**
- Listagem com busca por nome ou CPF
- Cadastro com validação de CPF (algoritmo de dígitos verificadores)
- Associação de acompanhante (com ou sem ocupação de vaga)
- Definição de prioridade: Alta (oncológico) ou Normal
- Geração de relatório PDF com histórico completo de viagens

**Viagens**
- Listagem com filtro por data
- Criação de viagem com motorista, placa e modelo do veículo
- Sugestão automática de motorista via escala rotativa
- Visão detalhada com todos os passageiros agendados
- Controle de presença e status de retorno por agendamento
- Contador de vagas em tempo real (ex.: `5/28`)

---

## Funcionalidades

| Código | Funcionalidade |
|--------|---------------|
| FR-001 | Cadastrar paciente com nome, CPF único, telefone, ponto de embarque e prioridade |
| FR-002 | Validação de CPF (formato + dígitos verificadores + unicidade) |
| FR-003 | Vincular acompanhante ao paciente (com flag de ocupação de vaga) |
| FR-004 | Prioridade Alta (oncológico) ou Normal por paciente |
| FR-005 | Editar dados cadastrais de paciente |
| FR-006 | Criar viagem para data específica (uma viagem por dia) |
| FR-007 | Associar motorista a uma viagem via lista pré-cadastrada |
| FR-008 | Escala rotativa automática: sistema indica o motorista da vez |
| FR-009 | Registrar placa e modelo do veículo na viagem |
| FR-010 | Controle de capacidade máxima: 28 vagas por viagem |
| FR-011 | Agendar paciente em viagem disponível |
| FR-012 | Motivo do deslocamento (texto livre) obrigatório no agendamento |
| FR-013 | Ponto de desembarque em Teresina (lista fixa) e destino real da consulta |
| FR-014 | Bloqueio de agendamento quando a viagem atinge 28 vagas |
| FR-015 | Cancelar agendamento em viagem futura, liberando as vagas |
| FR-016 | Impedir cancelamento de agendamentos em viagens já realizadas |
| FR-017 | Registrar presença ("Presente") ou falta ("Faltou") por paciente |
| FR-018 | Registrar status de retorno: "Voltou no Dia", "Ficou em Teresina" ou "Voltou por Conta Própria" |
| FR-019 | Listar viagens com filtro por data, exibindo passageiros e seus status |
| FR-020 | Gerar relatório PDF com histórico de viagens de um paciente |

### Pontos de Embarque (lista fixa)

SESAM · Praça da Bandeira · Sorveteria Cremosa · Memorial Espedito Resende · Vida Animal · Posto São Francisco · Posto Piripiri · Posto Petrolina · M. Sales · ELECNOR · Chico Jovem · Lili Doces · Entrada da Malhadinha · Capela da Várzea

### Pontos de Desembarque em Teresina (lista fixa)

CEIR · Hospital Policial · H.U. · São Marcos

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Runtime | Node.js | 20 LTS |
| Backend framework | Express | 4.19 |
| Banco de dados | SQLite via better-sqlite3 | 9.4.3 |
| Autenticação | express-session + bcryptjs | 1.18 / 2.4 |
| Geração de PDF | pdfkit | 0.15 |
| Frontend framework | React + React DOM | 18.3 |
| Roteamento SPA | react-router-dom | 6.24 |
| HTTP client | axios | 1.7 |
| Build tool | Vite | 5.3 |
| Testes backend | Jest + supertest | 29.7 / 7.0 |
| Dev runner | concurrently | 8.2 |

---

## Pré-requisitos

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **npm 9+** (incluído com Node.js)
- Git

Verifique a instalação:

```bash
node --version   # v20.x.x ou superior
npm --version    # 9.x.x ou superior
```

---

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd sesam-transportes-mvp
```

### 2. Instale todas as dependências

```bash
npm run install:all
```

Este comando instala as dependências da raiz, do backend e do frontend em sequência.

### 3. Configure as variáveis de ambiente

Crie o arquivo `backend/.env` com base no exemplo abaixo:

```env
PORT=3001
SESSION_SECRET=troque-por-uma-chave-secreta-forte-aqui
ADMIN_SENHA=admin123
```

> **Atenção**: Em produção, use uma `SESSION_SECRET` longa e aleatória. A `ADMIN_SENHA` é usada apenas no primeiro `db:setup` para criar o usuário administrador.

### 4. Inicialize o banco de dados

```bash
npm run db:setup
```

Este comando executa o script de seed que:
- Cria todas as tabelas (`usuarios`, `motoristas`, `pacientes`, `acompanhantes`, `viagens`, `agendamentos`)
- Insere os dois motoristas padrão: **Henrique** e **Claudio**
- Cria o usuário administrador com a senha definida em `ADMIN_SENHA`

O banco de dados é criado em `backend/data/sesam.db`.

---

## Rodando em Desenvolvimento

### Backend + Frontend simultaneamente (recomendado)

```bash
npm run dev
```

Inicia ambos os servidores em paralelo:
- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:5173`

O Vite já está configurado com proxy: qualquer requisição para `/api` é encaminhada automaticamente para o backend na porta 3001.

### Rodando separadamente

```bash
# Terminal 1 — Backend
cd backend
npm run dev    # usa node --watch para hot reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### Acessando o sistema

Abra `http://localhost:5173` no navegador. Faça login com:

| Campo | Valor padrão |
|-------|-------------|
| Usuário | `admin` |
| Senha | valor de `ADMIN_SENHA` no `.env` (padrão: `admin123`) |

---

## Testes

### Rodar todos os testes (unitários + integração)

```bash
npm test
```

### Somente testes unitários

```bash
cd backend
npm run test:unit
```

### Somente testes de integração

```bash
cd backend
npm run test:integration
```

### Cobertura de testes

Os testes cobrem as seguintes lógicas críticas:

| Arquivo de teste | O que valida |
|-----------------|-------------|
| `tests/unit/cpf.test.js` | Algoritmo de validação CPF (formato + dígitos verificadores) |
| `tests/unit/capacidade.test.js` | Cálculo e validação de vagas (paciente ± acompanhante) |
| `tests/unit/estadoPresenca.test.js` | Máquina de estados de presença (Pendente → Presente/Faltou) |
| `tests/unit/estadoRetorno.test.js` | Máquina de estados de retorno + pré-condição de presença |
| `tests/unit/escalaRotativa.test.js` | Alternância de motoristas por viagem |
| `tests/integration/pacientes.test.js` | CRUD de pacientes via API |
| `tests/integration/viagens.test.js` | CRUD de viagens + validação de capacidade |
| `tests/integration/agendamentos.test.js` | Agendamento, cancelamento e transições de estado |

---

## Estrutura de Pastas

```
sesam-transportes-mvp/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.js              # POST /api/auth/login, /logout
│   │   │   ├── pacientes.js         # CRUD /api/pacientes + relatório PDF
│   │   │   ├── motoristas.js        # GET /api/motoristas (com sugestão de escala)
│   │   │   ├── viagens.js           # CRUD /api/viagens
│   │   │   ├── agendamentos.js      # POST/agendamentos aninhados em viagens
│   │   │   └── agendamentosRoot.js  # DELETE/PATCH em /api/agendamentos/:id
│   │   ├── db/
│   │   │   ├── index.js             # Inicialização da conexão SQLite
│   │   │   ├── schema.sql           # DDL de todas as tabelas
│   │   │   └── seed.js              # Seed de motoristas e usuário admin
│   │   ├── middleware/
│   │   │   ├── auth.js              # Guarda de rota: verifica sessão ativa
│   │   │   └── validate.js          # Validadores reutilizáveis (CPF, listas fixas)
│   │   ├── services/
│   │   │   ├── pacienteService.js   # Lógica: cadastro, validação CPF, acompanhante
│   │   │   ├── viagemService.js     # Lógica: criação, capacidade, escala rotativa
│   │   │   ├── agendamentoService.js# Lógica: agendamento, cancelamento, estados
│   │   │   └── relatorioService.js  # Geração de PDF via pdfkit
│   │   └── app.js                   # Express app: rotas, middlewares, CORS, session
│   ├── tests/
│   │   ├── unit/                    # Testes de lógica pura (sem banco)
│   │   └── integration/             # Testes de API com banco em memória
│   ├── data/                        # sesam.db (gitignored)
│   ├── server.js                    # Entry point: listen na porta
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── AppShell.jsx        # Layout base com sidebar e navegação
│   │   │   ├── pacientes/
│   │   │   │   ├── PacienteForm.jsx    # Formulário de cadastro e edição
│   │   │   │   ├── PacienteLista.jsx   # Listagem com busca
│   │   │   │   └── AcompanhanteForm.jsx# Formulário de acompanhante
│   │   │   ├── viagens/
│   │   │   │   ├── ViagemForm.jsx      # Criar/editar viagem
│   │   │   │   ├── ViagemLista.jsx     # Listagem com filtro por data
│   │   │   │   └── ViagemDetalhe.jsx   # Passageiros + controle de presença
│   │   │   └── agendamentos/
│   │   │       └── AgendamentoForm.jsx # Agendar paciente em viagem
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── PacientesPage.jsx
│   │   │   └── ViagensPage.jsx
│   │   ├── services/
│   │   │   └── api.js                  # Wrapper axios: base URL + interceptors
│   │   └── main.jsx                    # Entry point React + roteamento
│   ├── vite.config.js                  # Proxy /api → localhost:3001
│   └── package.json
│
├── specs/
│   └── 001-patient-transport-mgmt/    # Documentação de especificação do MVP
│       ├── spec.md                    # Requisitos funcionais e user stories
│       ├── plan.md                    # Plano de implementação e estrutura
│       ├── research.md               # Decisões técnicas com rationale
│       ├── data-model.md             # Entidades, relacionamentos, máquinas de estado
│       ├── quickstart.md             # Guia de validação end-to-end
│       └── contracts/
│           └── api.md                # Contratos REST completos
│
├── package.json                       # Scripts raiz: dev, test, db:setup, install:all
├── CLAUDE.md                          # Instruções para o agente de desenvolvimento
└── README.md                          # Este arquivo
```

---

## Documentação da API

**Base URL**: `http://localhost:3001/api`  
**Autenticação**: Cookie de sessão (`connect.sid`). Todas as rotas exceto `/auth/login` exigem sessão ativa.  
**Formato de erro**: `{ "error": "<mensagem legível>" }`

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/login` | Autentica e inicia sessão |
| `POST` | `/auth/logout` | Encerra a sessão |

### Pacientes

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/pacientes` | Lista pacientes (busca opcional: `?q=nome`) |
| `GET` | `/pacientes/:id` | Retorna um paciente com acompanhante |
| `POST` | `/pacientes` | Cadastra novo paciente |
| `PUT` | `/pacientes/:id` | Atualiza dados (CPF não pode ser alterado) |
| `PUT` | `/pacientes/:id/acompanhante` | Cria ou atualiza acompanhante (upsert) |
| `DELETE` | `/pacientes/:id/acompanhante` | Remove acompanhante |
| `GET` | `/pacientes/:id/relatorio` | Gera e retorna PDF do histórico de viagens |

### Motoristas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/motoristas` | Lista motoristas com sugestão de escala rotativa |

### Viagens

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/viagens` | Lista viagens (filtro opcional: `?data=YYYY-MM-DD`) |
| `GET` | `/viagens/:id` | Retorna viagem com todos os agendamentos |
| `POST` | `/viagens` | Cria nova viagem |
| `PUT` | `/viagens/:id` | Atualiza motorista, placa ou modelo do veículo |

### Agendamentos

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/viagens/:viagem_id/agendamentos` | Agenda paciente na viagem |
| `DELETE` | `/agendamentos/:id` | Cancela agendamento (libera vagas) |
| `PATCH` | `/agendamentos/:id/presenca` | Registra `Presente` ou `Faltou` |
| `PATCH` | `/agendamentos/:id/retorno` | Registra status de retorno |

#### Códigos de resposta relevantes

| HTTP | Situação |
|------|----------|
| `201` | Recurso criado com sucesso |
| `204` | Operação realizada, sem corpo de resposta |
| `400` | Validação falhou (campo inválido, estado inválido) |
| `401` | Não autenticado |
| `404` | Recurso não encontrado |
| `409` | Conflito: CPF duplicado, data de viagem duplicada, capacidade esgotada |

Para a especificação completa com exemplos de request/response, consulte [`specs/001-patient-transport-mgmt/contracts/api.md`](specs/001-patient-transport-mgmt/contracts/api.md).

---

## Variáveis de Ambiente

Arquivo: `backend/.env`

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `PORT` | Não | `3001` | Porta em que o servidor Express escuta |
| `SESSION_SECRET` | **Sim** | — | Chave secreta para assinar o cookie de sessão. Use uma string longa e aleatória em produção. |
| `ADMIN_SENHA` | Sim (apenas no `db:setup`) | — | Senha do usuário `admin` gerada no primeiro setup. Após o setup, pode ser removida do `.env`. |

> O frontend não possui variáveis de ambiente — a URL da API é configurada via proxy do Vite em desenvolvimento e deve ser ajustada em `frontend/src/services/api.js` para produção.

---

## Primeiro Login

Após executar `npm run db:setup`:

1. Acesse `http://localhost:5173`
2. Entre com as credenciais:
   - **Usuário**: `admin`
   - **Senha**: valor definido em `ADMIN_SENHA` no `.env` (padrão de exemplo: `admin123`)
3. O sistema redireciona para a listagem de viagens

> O CPF não pode ser alterado após o cadastro. Para trocar CPF de um paciente, crie um novo registro.

---

## Regras de Negócio Importantes

**Capacidade de vagas**
- Cada agendamento consome 1 vaga (paciente)
- Se o paciente tem acompanhante com `ocupa_vaga = true`, consome +1 vaga
- Tentativas de ultrapassar 28 vagas são bloqueadas com erro `409`

**Máquinas de estado**

Presença:
```
Pendente → Presente
Pendente → Faltou
(estados finais — sem reversão)
```

Retorno (pré-condição: presença = Presente):
```
Pendente → Voltou no Dia
Pendente → Ficou em Teresina
Pendente → Voltou por Conta Própria
```

**Escala rotativa de motoristas**
- O sistema consulta a última viagem registrada e sugere o motorista oposto
- Se não houver viagem anterior, sugere o motorista de menor ID (Henrique)

**Cancelamento**
- Agendamentos em viagens com data < hoje não podem ser cancelados
- O cancelamento libera vagas imediatamente de forma transacional

---

## Metodologia de Desenvolvimento — Pipeline SDD/SpecKit

Este projeto foi desenvolvido utilizando o pipeline **Specification-Driven Development (SDD)** via **SpecKit**, uma metodologia que garante que cada linha de código rastreia diretamente um requisito especificado.

### As fases do pipeline

```
/speckit-specify   →  /speckit-clarify   →  /speckit-plan
      ↓                                           ↓
Especificação                             Plano técnico
(spec.md)                                 (plan.md)
                                               ↓
                                      /speckit-tasks
                                           ↓
                                        tasks.md
                                           ↓
                                   /speckit-implement
                                           ↓
                                    Código gerado
                                           ↓
                              /speckit-converge  (gap analysis)
                                           ↓
                                  /speckit-analyze (auditoria)
```

### Artefatos gerados por fase

| Fase | Comando | Artefato | Propósito |
|------|---------|----------|-----------|
| Especificação | `/speckit-specify` | `spec.md` | Requisitos funcionais, user stories, critérios de aceitação |
| Clarificação | `/speckit-clarify` | `spec.md` (atualizado) | Resolve ambiguidades antes de planejar |
| Planejamento | `/speckit-plan` | `plan.md`, `research.md`, `data-model.md`, `contracts/api.md` | Decisões técnicas, modelo de dados, contratos de API |
| Tarefas | `/speckit-tasks` | `tasks.md` | Lista de tarefas atômicas ordenadas por dependência |
| Implementação | `/speckit-implement` | Código-fonte | Execução das tarefas |
| Convergência | `/speckit-converge` | `tasks.md` (delta) | Identifica gaps entre spec e implementação |
| Análise | `/speckit-analyze` | Relatório | Auditoria de consistência entre artefatos |

### Por que SDD?

- **Rastreabilidade**: cada feature do código referencia um RF (ex.: `FR-014` → validação de capacidade)
- **API-First**: os contratos de API são definidos *antes* da implementação (ver `contracts/api.md`)
- **Test-Driven para lógica crítica**: validação de CPF, capacidade e máquinas de estado têm testes unitários escritos a partir da especificação
- **Sem over-engineering**: a constituição do projeto impõe o princípio MVP-First — nenhuma abstração ou feature além do especificado

Toda a documentação de especificação vive em [`specs/001-patient-transport-mgmt/`](specs/001-patient-transport-mgmt/).

---

## Roadmap — Próximos Passos

Funcionalidades fora do escopo do MVP atual, ordenadas por valor percebido:

| Prioridade | Feature |
|-----------|---------|
| P1 | Autenticação multi-usuário com controle de acesso por função (admin, visualizador) |
| P1 | Notificação por WhatsApp/SMS para lembrete de viagem ao paciente |
| P2 | Dashboard com métricas: total de viagens no mês, taxa de presença, pacientes frequentes |
| P2 | Histórico de edições de agendamentos (auditoria) |
| P2 | Suporte mobile (layout responsivo) |
| P3 | Exportação de listagem de passageiros para PDF/Excel no dia da viagem |
| P3 | Cadastro de múltiplos veículos e associação por frota |
| P3 | API pública para integração com outros sistemas da secretaria |
| P4 | Deploy automatizado (Docker Compose + Nginx) |
| P4 | Backup automático do banco SQLite |

---

## Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido para a **SESAM — Secretaria Municipal de Saúde**
