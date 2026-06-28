# SESAM Transportes — Sistema de Gerenciamento de Transporte de Pacientes

![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/Licença-MIT-green)
![Status](https://img.shields.io/badge/Status-MVP%20Completo-blue)

Sistema web administrativo desenvolvido para a **SESAM** (Secretaria Municipal de Saúde — Piauí) gerenciar o transporte diário de pacientes do município de **Piripiri** até **Teresina** para consultas médicas. O sistema cobre o ciclo completo: cadastro de pacientes, criação de viagens, agendamento com validação de capacidade (28 vagas), controle de presença, registro de retorno e geração de relatórios PDF.

---

## Contexto Acadêmico

Este projeto foi desenvolvido como **trabalho final** da disciplina **Tópicos Especiais em Computação**, utilizando a metodologia **Specification-Driven Development (SDD)** via **SpecKit** — um pipeline de desenvolvimento orientado por especificação que garante rastreabilidade completa entre requisitos e código.

O sistema resolve um problema real: o setor de transportes da SESAM controla diariamente quais pacientes embarcam no veículo que parte de Piripiri rumo a Teresina, e precisava substituir planilhas manuais por uma ferramenta web simples e auditável.

---

## Visão Geral do Sistema

O sistema possui duas telas principais acessadas por sidebar:

**Viagens**
- Listagem com filtro por data
- Criação de viagem com motorista, placa e modelo do veículo
- Sugestão automática de motorista via escala rotativa (Henrique ↔ Claudio)
- Visão detalhada com todos os passageiros, controle de presença e retorno
- Contador de vagas em tempo real (ex.: `5/28`)

**Pacientes**
- Listagem com busca por nome ou CPF
- Cadastro com validação de CPF (algoritmo de dígitos verificadores)
- Associação de acompanhante com ou sem ocupação de vaga
- Prioridade Alta (oncológico) ou Normal
- Geração de relatório PDF com histórico completo de viagens

---

## Funcionalidades Implementadas

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

### Pontos de Embarque (lista fixa — saída de Piripiri)

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
| Frontend framework | React + React DOM | 18.3.1 |
| Ícones UI | lucide-react | 1.22 |
| Roteamento SPA | react-router-dom | 6.24 |
| HTTP client | axios | 1.7 |
| Build tool | Vite | 5.3 |
| Testes backend | Jest + supertest | 29.7 / 7.0 |
| Dev runner | concurrently | 8.2 |

---

## Pré-requisitos

### Mac / Linux

- **Node.js 20 LTS** — [nodejs.org](https://nodejs.org) ou via `nvm`:
  ```bash
  nvm install 20
  nvm use 20
  ```
- **npm 9+** (incluído com Node.js 20)
- Git

Verifique:
```bash
node --version   # v20.x.x
npm --version    # 9.x.x ou superior
```

### Windows

> **Atenção**: `better-sqlite3` é um módulo nativo e requer ferramentas de compilação C++ no Windows.

1. Instale o **Node.js 20 LTS** em [nodejs.org](https://nodejs.org)
2. Abra o **PowerShell como Administrador** e execute:
   ```powershell
   npm install --global windows-build-tools
   ```
   Ou instale manualmente o **Visual Studio Build Tools** (componente "Desenvolvimento para Desktop com C++")
3. Verifique a instalação:
   ```powershell
   node --version   # v20.x.x
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

Crie o arquivo `backend/.env`:

```env
PORT=3001
SESSION_SECRET=troque-por-uma-chave-secreta-forte-aqui
ADMIN_LOGIN=admin
ADMIN_PASSWORD=admin123
```

> **Em produção**: use uma `SESSION_SECRET` longa e aleatória (mínimo 32 caracteres). `ADMIN_LOGIN` e `ADMIN_PASSWORD` são usados apenas no primeiro `db:setup`.

### 4. Inicialize o banco de dados

```bash
npm run db:setup
```

Este script cria todas as tabelas e insere:
- **Motoristas padrão**: Henrique e Claudio
- **Usuário administrador** com login/senha definidos no `.env`

O banco de dados é criado em `backend/data/sesam.db` (ignorado pelo git).

---

## Rodando em Desenvolvimento

### Backend + Frontend simultaneamente (recomendado)

```bash
npm run dev
```

Inicia ambos os servidores em paralelo:
- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:5173`

O Vite encaminha automaticamente requisições `/api` para o backend (configurado em `frontend/vite.config.js`).

### Rodando separadamente

```bash
# Terminal 1 — Backend
cd backend
npm run dev    # usa node --watch para hot reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### Credenciais de acesso padrão

Acesse `http://localhost:5173` e faça login com:

| Campo | Valor padrão |
|-------|-------------|
| Usuário | valor de `ADMIN_LOGIN` no `.env` (padrão: `admin`) |
| Senha | valor de `ADMIN_PASSWORD` no `.env` (padrão: `admin123`) |

---

## Rodando em Produção com Ngrok

Para expor o sistema localmente via HTTPS (útil para testes em redes externas ou apresentações):

### 1. Faça o build do frontend

```bash
cd frontend && npm run build
```

O backend serve o `frontend/dist/` diretamente em produção (single-server, sem separação de portas).

### 2. Configure o `.env` para produção

```env
PORT=3001
NODE_ENV=production
SESSION_SECRET=sua-chave-secreta-muito-longa-e-aleatoria
ADMIN_LOGIN=admin
ADMIN_PASSWORD=senha-segura
```

> Com `NODE_ENV=production`, o cookie de sessão é configurado como `secure: true` e `sameSite: none`, necessários para funcionar via HTTPS (Ngrok).

### 3. Inicie o backend

```bash
cd backend && npm start
```

### 4. Exponha com Ngrok

```bash
ngrok http 3001
```

O Ngrok fornece uma URL HTTPS (ex.: `https://xxxx.ngrok.io`). Acesse esta URL no navegador — o sistema estará disponível com HTTPS.

> O backend serve o frontend buildado automaticamente via `express.static`. Não é necessário Vite em produção.

---

## Testes

### Rodar todos os testes (unitários + integração)

```bash
npm test
```

### Somente testes unitários

```bash
cd backend && npm run test:unit
```

### Somente testes de integração

```bash
cd backend && npm run test:integration
```

### Status atual dos testes

```
Test Suites: 8 passed, 8 total
Tests:       63 passed, 63 total
```

### Cobertura

| Arquivo | O que valida |
|---------|-------------|
| `unit/cpf.test.js` | Algoritmo de validação CPF (formato + dígitos verificadores) |
| `unit/capacidade.test.js` | Cálculo e validação de vagas (paciente ± acompanhante) |
| `unit/estadoPresenca.test.js` | Máquina de estados de presença (Pendente → Presente/Faltou) |
| `unit/estadoRetorno.test.js` | Máquina de estados de retorno + pré-condição de presença |
| `unit/escalaRotativa.test.js` | Alternância de motoristas por viagem |
| `integration/pacientes.test.js` | CRUD de pacientes via API |
| `integration/viagens.test.js` | CRUD de viagens + validação de capacidade |
| `integration/agendamentos.test.js` | Agendamento, cancelamento e transições de estado |

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
│   │   │   ├── agendamentos.js      # POST agendamentos aninhados em viagens
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
│   │   └── app.js                   # Express: CORS, session, rotas, static
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
│   │   │   │   └── AppShell.jsx        # Sidebar + layout base
│   │   │   ├── pacientes/
│   │   │   │   ├── PacienteForm.jsx    # Formulário de cadastro e edição
│   │   │   │   ├── PacienteLista.jsx   # Listagem com busca
│   │   │   │   └── AcompanhanteForm.jsx
│   │   │   ├── viagens/
│   │   │   │   ├── ViagemForm.jsx      # Criar/editar viagem
│   │   │   │   ├── ViagemLista.jsx     # Listagem com filtro por data
│   │   │   │   └── ViagemDetalhe.jsx   # Passageiros + controle de presença/retorno
│   │   │   └── agendamentos/
│   │   │       └── AgendamentoForm.jsx # Agendar paciente em viagem
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── PacientesPage.jsx
│   │   │   └── ViagensPage.jsx
│   │   ├── services/
│   │   │   └── api.js                  # Wrapper axios: base URL + interceptors
│   │   └── main.jsx                    # Entry point React + roteamento
│   ├── vite.config.js                  # Proxy /api → localhost:3001 em dev
│   └── package.json
│
├── specs/
│   └── 001-patient-transport-mgmt/    # Artefatos SDD do MVP
│       ├── spec.md                    # Requisitos funcionais e user stories
│       ├── plan.md                    # Plano técnico e estrutura do projeto
│       ├── research.md                # Decisões técnicas com rationale
│       ├── data-model.md              # Entidades, relacionamentos, máquinas de estado
│       ├── quickstart.md              # Guia de validação end-to-end
│       ├── tasks.md                   # Tarefas atômicas ordenadas por dependência
│       └── contracts/
│           └── api.md                 # Contratos REST completos com exemplos
│
├── package.json                       # Scripts raiz: dev, test, db:setup, install:all
├── CLAUDE.md                          # Instruções para o agente de desenvolvimento
└── README.md                          # Este arquivo
```

---

## Endpoints da API

**Base URL**: `http://localhost:3001/api`  
**Autenticação**: Cookie de sessão (`connect.sid`). Todas as rotas exceto `/auth/login` exigem sessão ativa.  
**Formato de erro**: `{ "error": "<mensagem legível>" }`

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/login` | Autentica e inicia sessão |
| `POST` | `/auth/logout` | Encerra a sessão |
| `GET` | `/auth/me` | Retorna usuário da sessão atual |

### Pacientes

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/pacientes` | Lista pacientes (busca opcional: `?q=nome`) |
| `GET` | `/pacientes/:id` | Retorna paciente com acompanhante |
| `POST` | `/pacientes` | Cadastra novo paciente |
| `PUT` | `/pacientes/:id` | Atualiza dados (CPF imutável) |
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
| `POST` | `/viagens/:id/agendamentos` | Agenda paciente na viagem |
| `DELETE` | `/agendamentos/:id` | Cancela agendamento (libera vagas) |
| `PATCH` | `/agendamentos/:id/presenca` | Registra `Presente` ou `Faltou` |
| `PATCH` | `/agendamentos/:id/retorno` | Registra status de retorno |

#### Códigos de resposta

| HTTP | Situação |
|------|----------|
| `201` | Recurso criado com sucesso |
| `204` | Operação realizada, sem corpo de resposta |
| `400` | Validação falhou (campo inválido, estado inválido) |
| `401` | Não autenticado |
| `404` | Recurso não encontrado |
| `409` | Conflito: CPF duplicado, data duplicada, capacidade esgotada |

Especificação completa com exemplos: [`specs/001-patient-transport-mgmt/contracts/api.md`](specs/001-patient-transport-mgmt/contracts/api.md)

---

## Variáveis de Ambiente

Arquivo: `backend/.env`

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `PORT` | Não | `3001` | Porta em que o backend escuta |
| `NODE_ENV` | Não | — | Defina `production` para ativar cookie seguro (HTTPS) |
| `SESSION_SECRET` | **Sim em produção** | `sesam-dev-secret` | Chave secreta para assinar o cookie de sessão |
| `ADMIN_LOGIN` | Sim (apenas no `db:setup`) | — | Login do usuário administrador |
| `ADMIN_PASSWORD` | Sim (apenas no `db:setup`) | — | Senha do usuário administrador |

---

## Regras de Negócio

**Capacidade de vagas**
- Cada agendamento consome 1 vaga (paciente)
- Se o acompanhante tem `ocupa_vaga = true`, consome +1 vaga
- Tentativas de ultrapassar 28 vagas retornam `409 Conflict`

**Máquinas de estado**

Presença (estados finais, sem reversão):
```
Pendente → Presente
Pendente → Faltou
```

Retorno (pré-condição: presença = Presente):
```
Pendente → Voltou no Dia
Pendente → Ficou em Teresina
Pendente → Voltou por Conta Própria
```

**Escala rotativa de motoristas**
- Consulta a última viagem registrada e sugere o motorista oposto
- Sem viagem anterior: sugere Henrique (menor ID)

**Cancelamento**
- Agendamentos em viagens passadas (data < hoje) não podem ser cancelados
- O cancelamento libera vagas de forma transacional (sem inconsistência)

---

## Metodologia — Pipeline SDD/SpecKit

Este projeto foi desenvolvido com **Specification-Driven Development (SDD)** via **SpecKit**, garantindo rastreabilidade completa entre requisitos e código.

### Pipeline de desenvolvimento

```
/speckit-specify   →  /speckit-clarify   →  /speckit-plan
      ↓                                           ↓
  spec.md                               plan.md, research.md,
  (user stories,                        data-model.md,
   critérios de aceite)                 contracts/api.md
                                               ↓
                                      /speckit-tasks
                                           ↓
                                        tasks.md
                                           ↓
                                   /speckit-implement
                                           ↓
                                    Código gerado
                                           ↓
                              /speckit-converge  (análise de gaps)
```

### Fases e artefatos

| Fase | Comando | Artefato | Propósito |
|------|---------|----------|-----------|
| Especificação | `/speckit-specify` | `spec.md` | Requisitos funcionais, user stories, critérios de aceite |
| Clarificação | `/speckit-clarify` | `spec.md` (atualizado) | Resolve ambiguidades antes de planejar |
| Planejamento | `/speckit-plan` | `plan.md` + `research.md` + `data-model.md` + `contracts/api.md` | Decisões técnicas, modelo de dados, contratos de API |
| Tarefas | `/speckit-tasks` | `tasks.md` | Lista atômica de tarefas ordenadas por dependência |
| Implementação | `/speckit-implement` | Código-fonte | Execução das tarefas |
| Convergência | `/speckit-converge` | `tasks.md` (delta) | Identifica gaps entre spec e implementação |

### Por que SDD?

- **Rastreabilidade**: cada feature do código referencia um RF (ex.: `FR-014` → validação de capacidade)
- **API-First**: contratos de API definidos *antes* da implementação
- **Test-Driven para lógica crítica**: validação de CPF, capacidade e máquinas de estado têm testes unitários derivados da especificação
- **MVP-First**: a constituição do projeto impede abstrações além do especificado

Documentação completa em [`specs/001-patient-transport-mgmt/`](specs/001-patient-transport-mgmt/).

---

## Roadmap — Próximos Passos

| Prioridade | Feature |
|-----------|---------|
| P1 | Autenticação multi-usuário com controle de acesso por função (admin, visualizador) |
| P1 | Notificação por WhatsApp/SMS para lembrete de viagem ao paciente |
| P2 | Dashboard: total de viagens no mês, taxa de presença, pacientes frequentes |
| P2 | Migração de dados históricos 2023+ para popular o banco |
| P2 | Suporte a rotas de UBS: múltiplas origens além de Piripiri |
| P2 | Layout responsivo para uso em tablets e celulares |
| P3 | Exportação da lista de passageiros para PDF/Excel no dia da viagem |
| P3 | Cadastro de múltiplos veículos por frota |
| P4 | Deploy automatizado com Docker Compose + Nginx |
| P4 | Backup automático do banco SQLite |

---

## Licença

Este projeto está licenciado sob a **Licença MIT**.

---

Desenvolvido para a **SESAM — Secretaria Municipal de Saúde · Piripiri, Piauí**
