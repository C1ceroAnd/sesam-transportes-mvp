# Implementation Plan: Gerenciamento de Transporte de Pacientes SESAM

**Branch**: `001-patient-transport-mgmt` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-patient-transport-mgmt/spec.md`

---

## Summary

Sistema web administrativo para gerenciar o transporte diário de pacientes da SESAM até Teresina para consultas médicas. O sistema permite cadastrar pacientes, criar viagens diárias, agendar pacientes com validação de capacidade (28 vagas), registrar presença e status de retorno, e gerar relatórios PDF por paciente.

A abordagem técnica é: backend REST (Node.js/Express + SQLite) + frontend SPA (React/Vite), com autenticação por sessão e geração de PDF server-side via `pdfkit`. Todos os detalhes técnicos foram resolvidos em `research.md`.

---

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS para backend; React 18 para frontend)

**Primary Dependencies**:
- Backend: `express`, `better-sqlite3`, `express-session`, `bcryptjs`, `pdfkit`, `cors`
- Frontend: `react`, `react-router-dom`, `axios`

**Storage**: SQLite (arquivo único `backend/data/sesam.db`)

**Testing**: Jest (backend — lógica de negócio: validação CPF, capacidade, máquinas de estado; frontend — componentes críticos)

**Target Platform**: Navegador web desktop (Chrome/Edge modernos); servidor Node.js local ou VPS simples

**Project Type**: Web application (backend REST API + frontend SPA)

**Performance Goals**: Operação fluida para 1–5 usuários simultâneos; PDF gerado em < 10 segundos; listagem de viagens em < 1 segundo

**Constraints**: Offline-capable não requerido; mobile não é requisito do MVP; deploy simplificado (sem Docker obrigatório)

**Scale/Scope**: ~100 pacientes, 1 viagem/dia, 2 motoristas; operação interna para equipe administrativa da SESAM

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
|-----------|--------|-----------|
| I. MVP-First | ✅ PASS | Escopo limitado exatamente aos 13 RF do spec; sem funcionalidades adicionais |
| II. API-First | ✅ PASS | Contratos REST definidos em `contracts/api.md` antes da implementação |
| III. Test-Driven for Critical Logic | ✅ PASS | Testes unitários planejados para: validação CPF, capacidade de vagas, máquinas de estado de presença e retorno, cálculo de escala rotativa |
| IV. Data Integrity First | ✅ PASS | Validação de `ponto_embarque` e `ponto_desembarque` na camada de serviço; transições de estado explícitas com pré-condições definidas no data model |
| V. Simplicity | ✅ PASS | Sem repository pattern, event bus ou microserviços; Express direto + SQLite; sem ORM (queries SQL explícitas via better-sqlite3) |

**Complexity Tracking**: Nenhuma violação — tabela não aplicável.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-patient-transport-mgmt/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas e rationale
├── data-model.md        # Entidades, relacionamentos, máquinas de estado
├── quickstart.md        # Guia de validação end-to-end
├── contracts/
│   └── api.md           # Contratos REST completos
└── tasks.md             # Gerado por /speckit-tasks (ainda não criado)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── db/
│   │   ├── index.js          # Inicialização do SQLite e conexão
│   │   ├── schema.sql         # DDL das tabelas
│   │   └── seed.js            # Seed de motoristas e usuário admin
│   ├── services/
│   │   ├── pacienteService.js    # Lógica de negócio: cadastro, validação CPF
│   │   ├── viagemService.js      # Lógica: criação, capacidade, escala rotativa
│   │   ├── agendamentoService.js # Lógica: agendamento, cancelamento, estados
│   │   └── relatorioService.js   # Geração de PDF via pdfkit
│   ├── api/
│   │   ├── auth.js            # Rotas de login/logout
│   │   ├── pacientes.js       # Rotas /api/pacientes
│   │   ├── motoristas.js      # Rotas /api/motoristas
│   │   ├── viagens.js         # Rotas /api/viagens
│   │   └── agendamentos.js    # Rotas /api/agendamentos
│   ├── middleware/
│   │   ├── auth.js            # Middleware de autenticação (session check)
│   │   └── validate.js        # Validadores reutilizáveis (CPF, listas fixas)
│   └── app.js                 # Express app setup
├── tests/
│   ├── unit/
│   │   ├── cpf.test.js            # Algoritmo de validação CPF
│   │   ├── capacidade.test.js     # Cálculo e validação de vagas
│   │   ├── estadoPresenca.test.js # Máquina de estado presença
│   │   └── estadoRetorno.test.js  # Máquina de estado retorno
│   └── integration/
│       ├── pacientes.test.js      # Integração CRUD pacientes
│       ├── viagens.test.js        # Integração CRUD viagens + capacidade
│       └── agendamentos.test.js   # Integração agendamento + cancelamento
├── data/                      # Pasta do arquivo SQLite (gitignored)
├── package.json
└── server.js                  # Entry point (porta 3001)

frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppShell.jsx        # Layout base com navegação
│   │   ├── pacientes/
│   │   │   ├── PacienteForm.jsx    # Formulário cadastro/edição
│   │   │   ├── PacienteLista.jsx   # Listagem de pacientes
│   │   │   └── AcompanhanteForm.jsx
│   │   ├── viagens/
│   │   │   ├── ViagemForm.jsx      # Criar/editar viagem
│   │   │   ├── ViagemLista.jsx     # Listagem/filtro por data
│   │   │   └── ViagemDetalhe.jsx   # Passageiros + controle de presença
│   │   └── agendamentos/
│   │       └── AgendamentoForm.jsx # Agendar paciente em viagem
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── PacientesPage.jsx
│   │   └── ViagensPage.jsx
│   ├── services/
│   │   └── api.js              # Wrapper axios com base URL e interceptors
│   └── main.jsx                # React entry point
├── package.json
└── vite.config.js

# Raiz do repositório
package.json          # Scripts de conveniência (dev, build, test)
```

**Structure Decision**: Web application (Option 2 — backend + frontend separados). Backend em `backend/`, frontend em `frontend/`. A separação permite que os contratos de API sejam a única interface entre as camadas, conforme Princípio II da Constituição.
