# Tasks: Gerenciamento de Transporte de Pacientes SESAM

**Input**: Design documents from `specs/001-patient-transport-mgmt/`

**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/api.md ✅, research.md ✅, quickstart.md ✅

**Tests**: Unit tests for critical business logic are **mandatory** per Constitution Principle III (CPF validation, capacity calculation, presence/return state machines, escala rotativa). Integration tests are included in the Polish phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Exact file paths are included in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and folder structure before any code is written

- [X] T001 Create project folder structure: `backend/src/{db,services,api,middleware}/`, `backend/tests/{unit,integration}/`, `backend/data/`, `frontend/src/{components/{layout,pacientes,viagens,agendamentos},pages,services}/`
- [X] T002 Initialize `backend/package.json` with dependencies: `express`, `better-sqlite3`, `express-session`, `bcryptjs`, `pdfkit`, `cors`; devDependencies: `jest`, `supertest`; add `"test": "jest"` and `"start": "node server.js"` scripts
- [X] T003 [P] Initialize `frontend/package.json` with Vite + React 18 template; add dependencies: `react-router-dom`, `axios`; verify `"dev": "vite"` script
- [X] T004 [P] Configure root `package.json` with convenience scripts: `"dev"` (runs backend + frontend concurrently), `"test"` (runs backend jest), `"db:setup"` (runs `backend/src/db/seed.js`)

**Checkpoint**: Folder structure exists and all packages install without errors via `npm install`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure — database schema, auth, Express app, React shell — that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Write DDL for all 5 tables in `backend/src/db/schema.sql`: `usuarios`, `pacientes`, `acompanhantes`, `motoristas`, `viagens`, `agendamentos` with correct column types, NOT NULL constraints, UNIQUE constraints, and foreign keys as specified in data-model.md
- [X] T006 Implement `backend/src/db/index.js`: open SQLite connection to `backend/data/sesam.db`, run `schema.sql` via `fs.readFileSync` + `db.exec()`, export singleton `db` instance using `better-sqlite3`
- [X] T007 Create `backend/src/db/seed.js`: insert motoristas Henrique and Claudio; insert admin user with bcrypt-hashed password read from `ADMIN_PASSWORD` env var (default `admin123`); use `INSERT OR IGNORE` to be idempotent
- [X] T008 [P] Implement `backend/src/middleware/validate.js`: export `validarCPF(cpf)` (módulo 11 algorithm — strip formatting, check 11 digits, compute both check digits), `PONTOS_EMBARQUE` array (14 values from spec), `PONTOS_DESEMBARQUE_TERESINA` array (4 values: CEIR, Hospital Policial, H.U., São Marcos), `STATUS_PRESENCA` array, `STATUS_RETORNO` array
- [X] T009 [P] Write unit tests for CPF validation in `backend/tests/unit/cpf.test.js`: test valid CPFs (529.982.247-25), invalid check digits, all-same-digit CPFs (111.111.111-11), wrong format — **must FAIL before T008 is implemented**
- [X] T010 [P] Implement `backend/src/middleware/auth.js`: export `requireAuth` middleware that checks `req.session.userId`; returns `401 { "error": "Não autenticado" }` if no session; calls `next()` otherwise
- [X] T011 Setup Express app in `backend/src/app.js`: configure `cors({ origin: 'http://localhost:5173', credentials: true })`, `express.json()`, `express-session` with `secret` from `SESSION_SECRET` env var, `resave: false`, `saveUninitialized: false`; placeholder comments for router mounting
- [X] T012 Create `backend/server.js`: import `app` from `./src/app.js`, listen on `PORT` env var (default 3001), log ready message
- [X] T013 Implement auth routes in `backend/src/api/auth.js`: `POST /login` — query `usuarios` by login, compare password with `bcryptjs.compare`, set `req.session.userId` on success, return `{ ok: true }` or `401`; `POST /logout` — call `req.session.destroy()`, return 204; mount under `/api/auth` in `app.js`
- [X] T014 [P] Configure `frontend/vite.config.js`: add `server.proxy` to forward `/api` requests to `http://localhost:3001`
- [X] T015 [P] Create `frontend/src/services/api.js`: configure axios instance with `baseURL: '/api'` and `withCredentials: true`; export named functions for each endpoint group (auth, pacientes, motoristas, viagens, agendamentos)
- [X] T016 [P] Create `frontend/src/main.jsx`: wrap `<App />` in `<BrowserRouter>`; implement `PrivateRoute` component that redirects unauthenticated users to `/login` by checking `GET /api/auth/me` or session state
- [X] T017 Create `frontend/src/components/layout/AppShell.jsx`: layout wrapper with top nav bar containing links to `/pacientes` and `/viagens`; renders `{children}` in main content area; show logout button that calls `POST /api/auth/logout` and redirects to `/login`
- [X] T018 Create `frontend/src/pages/LoginPage.jsx`: form with login and senha fields; on submit call `POST /api/auth/login`; on success redirect to `/viagens`; display error message on failure

**Checkpoint**: `npm run db:setup` seeds DB; backend starts on 3001; `POST /api/auth/login` returns 200; frontend starts on 5173 with login page visible and redirects unauthenticated routes to `/login`

---

## Phase 3: User Story 1 — Cadastrar e Agendar Paciente em Viagem (Priority: P1) 🎯 MVP

**Goal**: Admin can register a patient with optional companion, then schedule that patient into an existing trip with capacity validation.

**Independent Test**: Create a patient, seed a trip via direct DB insert (or complete US2 first), schedule the patient into the trip; verify capacity counting and 28-slot enforcement.

### Critical Logic Tests for User Story 1 (Constitution Principle III — write before implementation)

> **NOTE: Write these tests FIRST — they must FAIL before the corresponding services are implemented**

- [X] T019 [P] [US1] Write capacity unit tests in `backend/tests/unit/capacidade.test.js`: test `calcularVagasAgendamento(acompanhante)` returns 1 (no companion) or 2 (companion with `ocupa_vaga=true`); test that scheduling fails when `vagas_ocupadas + vagas_necessarias > 28`; test boundary at exactly 28 vagas
- [X] T020 [P] [US1] Write presence state machine unit tests in `backend/tests/unit/estadoPresenca.test.js`: `Pendente → Presente` allowed; `Pendente → Faltou` allowed; `Presente → Pendente` rejected; `Faltou → Pendente` rejected; `Faltou → Presente` rejected
- [X] T021 [P] [US1] Write return state machine unit tests in `backend/tests/unit/estadoRetorno.test.js`: `Pendente → Voltou no Dia` allowed only when `status_presenca = Presente`; `Pendente → Ficou em Teresina` allowed; `Pendente → Voltou por Conta Própria` allowed; all transitions rejected when `status_presenca = Faltou`

### Implementation for User Story 1

- [X] T022 [P] [US1] Implement `backend/src/services/pacienteService.js`: `createPaciente(data)` — validate CPF with `validarCPF`, check `ponto_embarque` in fixed list, insert to DB, throw on duplicate CPF with code 409; `getPacientes(q)` — query with optional name/CPF substring search, join `acompanhantes`; `getPacienteById(id)`; `updatePaciente(id, data)` — block CPF changes; `upsertAcompanhante(pacienteId, data)` — INSERT OR REPLACE; `deleteAcompanhante(pacienteId)`
- [X] T023 [US1] Implement `backend/src/api/pacientes.js`: routes `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `PUT /:id/acompanhante`, `DELETE /:id/acompanhante` — all protected by `requireAuth`; map service errors to correct HTTP codes (400, 404, 409); mount under `/api/pacientes` in `backend/src/app.js`
- [X] T024 [P] [US1] Implement `backend/src/services/agendamentoService.js`: `createAgendamento(viagemId, data)` — check trip exists, validate `ponto_desembarque_teresina` in fixed list, calculate `vagas_necessarias` (1 or 2 based on companion `ocupa_vaga`), check capacity in single SQLite transaction, insert agendamento and update `viagens.vagas_ocupadas`; `cancelAgendamento(id)` — check trip date >= today (else 400), delete agendamento and decrement `vagas_ocupadas` in transaction; `updatePresenca(id, status)` — validate state machine transition; `updateRetorno(id, status)` — validate `status_presenca = Presente` precondition and state machine transition
- [X] T025 [US1] Implement `backend/src/api/agendamentos.js`: `POST /api/viagens/:viagem_id/agendamentos`, `DELETE /api/agendamentos/:id`, `PATCH /api/agendamentos/:id/presenca`, `PATCH /api/agendamentos/:id/retorno` — all protected by `requireAuth`; mount both route groups in `backend/src/app.js`
- [X] T026 [P] [US1] Create `frontend/src/components/pacientes/PacienteLista.jsx`: table listing all patients with columns nome, CPF, ponto_embarque, prioridade; search input calling `GET /api/pacientes?q=`; row actions: Editar, Gerar PDF (calls `GET /api/pacientes/:id/relatorio` and triggers download)
- [X] T027 [P] [US1] Create `frontend/src/components/pacientes/PacienteForm.jsx`: form for create and edit with fields: nome, CPF (disabled on edit), telefone, ponto_embarque `<select>` (14 options from fixed list), prioridade radio (Alta/Normal); submit calls `POST /api/pacientes` or `PUT /api/pacientes/:id`; display inline validation error for CPF and 409 conflicts
- [X] T028 [P] [US1] Create `frontend/src/components/pacientes/AcompanhanteForm.jsx`: sub-form embedded in patient edit view; fields: nome, ocupa_vaga checkbox; buttons Save and Remove; calls `PUT /api/pacientes/:id/acompanhante` or `DELETE /api/pacientes/:id/acompanhante`
- [X] T029 [US1] Create `frontend/src/pages/PacientesPage.jsx`: renders `PacienteLista` by default; shows `PacienteForm` in modal or side panel for create/edit; includes `AcompanhanteForm` within edit panel; register route `/pacientes` in `frontend/src/main.jsx`
- [X] T030 [US1] Create `frontend/src/components/agendamentos/AgendamentoForm.jsx`: modal or inline form within trip detail view; fields: patient picker `<select>` (search-filtered via `GET /api/pacientes?q=`), motivo_deslocamento textarea, ponto_desembarque_teresina `<select>` (4 options), destino_consulta input; submit calls `POST /api/viagens/:id/agendamentos`; display 409 capacity error in Portuguese

**Checkpoint**: Admin can register a patient with companion, open an existing trip, schedule the patient, see 2/28 vagas consumed; scheduling 28 patients blocks further additions with a clear error message

---

## Phase 4: User Story 2 — Configurar Viagem (Motorista e Veículo) (Priority: P1)

**Goal**: Admin can create a daily trip, assign a driver from the rotating schedule suggestion, and record vehicle plate/model.

**Independent Test**: Create two consecutive trips and verify the driver suggestion alternates between Henrique and Claudio; verify duplicate-date prevention.

### Critical Logic Test for User Story 2 (Constitution Principle III)

- [X] T031 [P] [US2] Write unit tests for escala rotativa in `backend/tests/unit/escalaRotativa.test.js`: given no previous trip → suggest motorista id 1; given last trip used motorista id 1 → suggest id 2; given last trip used motorista id 2 → suggest id 1; test the pure calculation function in isolation

### Implementation for User Story 2

- [X] T032 [P] [US2] Implement `backend/src/services/viagemService.js`: `createViagem(data)` — validate `data` as ISO date, check UNIQUE constraint on `data` (409 if duplicate), insert viagem; `getViagens(dateFilter)` — query all viagens ordered by data desc, optional WHERE date = filter, LEFT JOIN agendamentos with pacientes; `getViagemById(id)` — same join, 404 if not found; `updateViagem(id, data)` — partial update of motorista_id, placa, modelo_veiculo; `getSugestaoEscala()` — query last viagem by data desc, return opposite motorista_id (or id 1 if none)
- [X] T033 [P] [US2] Implement `backend/src/api/motoristas.js`: `GET /api/motoristas` — list both motoristas + call `getSugestaoEscala()` to compute `sugestao_escala_id`; mount under `/api/motoristas` in `backend/src/app.js`
- [X] T034 [US2] Implement `backend/src/api/viagens.js`: `POST /api/viagens`, `GET /api/viagens`, `GET /api/viagens/:id`, `PUT /api/viagens/:id` — all protected by `requireAuth`; mount under `/api/viagens` in `backend/src/app.js`
- [X] T035 [P] [US2] Create `frontend/src/components/viagens/ViagemForm.jsx`: form with date input, motorista `<select>` (fetches `GET /api/motoristas`, highlights suggested driver with "(sugerido)" label), placa input, modelo_veiculo input; submit calls `POST /api/viagens`; display 409 duplicate-date error in Portuguese
- [X] T036 [P] [US2] Create `frontend/src/components/viagens/ViagemLista.jsx`: list of trips with date, driver name, `vagas_ocupadas/28`, placa; date filter input calling `GET /api/viagens?data=`; each row links to `/viagens/:id`; "Nova Viagem" button opens `ViagemForm`
- [X] T037 [US2] Create `frontend/src/pages/ViagensPage.jsx`: renders `ViagemLista`; register route `/viagens` in `frontend/src/main.jsx`; register child route `/viagens/:id` pointing to `ViagemDetalhe` (to be implemented in US3)

**Checkpoint**: Admin can create a trip for tomorrow, see driver suggestion toggle on the second trip, register vehicle data, and be blocked from creating a second trip on the same date

---

## Phase 5: User Story 3 — Registrar Presença e Status de Retorno (Priority: P2)

**Goal**: Admin can view trip's passenger list and mark each patient as present/absent; mark return status for present patients.

**Independent Test**: With existing trip + agendamentos (from US1+US2), open trip detail, mark a patient Present, then set return status to "Voltou no Dia"; verify blocked state when patient status is "Faltou".

- [X] T038 [US3] Create `frontend/src/components/viagens/ViagemDetalhe.jsx`: fetch `GET /api/viagens/:id`; render trip header (date, driver, vagas, plate/model); render passenger table with columns: nome, ponto_embarque, prioridade, motivo; presença control — radio group (Pendente/Presente/Faltou) calling `PATCH /api/agendamentos/:id/presenca`; retorno control — `<select>` (disabled if `status_presenca ≠ Presente`) calling `PATCH /api/agendamentos/:id/retorno`; also renders `AgendamentoForm` via "Agendar Paciente" button
- [X] T039 [US3] Wire `ViagemDetalhe` into `/viagens/:id` route in `frontend/src/pages/ViagensPage.jsx`; ensure `ViagemLista` trip rows navigate to this route

**Checkpoint**: Admin opens a trip detail page, sees all scheduled patients, marks presença and retorno, and is blocked from setting retorno on a patient marked as Faltou

---

## Phase 6: User Story 4 — Cancelar Agendamento (Priority: P2)

**Goal**: Admin can cancel a scheduled patient from a future trip, restoring the freed slots to the trip's availability count.

**Independent Test**: Cancel an existing agendamento on a future trip and verify `vagas_ocupadas` decrements correctly (by 1 or 2 depending on companion); verify past-trip cancellation is blocked.

- [X] T040 [US4] Add "Cancelar" button per passenger row in `frontend/src/components/viagens/ViagemDetalhe.jsx`: on click show confirmation dialog; call `DELETE /api/agendamentos/:id`; on success refresh trip data to show updated `vagas_ocupadas`; display 400 error message when trip is already past ("Não é possível cancelar agendamentos de viagens já realizadas")

**Checkpoint**: Cancelling a future agendamento (with 2-seat companion) reduces trip counter from 2 to 0; attempting to cancel a past trip agendamento shows the blocking error message

---

## Phase 7: User Story 5 — Consultar Viagens e Gerar Relatório PDF (Priority: P3)

**Goal**: Admin can filter trips by date to see passenger status, and download a PDF with any patient's complete trip history.

**Independent Test**: Filter trips by a specific date, verify only that date's trip appears with all passenger data; generate PDF for a patient with multiple trip records, verify PDF contains all required fields ordered by date.

- [X] T041 [US5] Implement `backend/src/services/relatorioService.js`: `generatePDF(pacienteId)` — query patient + all agendamentos with viagem data ordered by date asc; if no agendamentos return null; use `pdfkit` to create PDF with patient header (nome, CPF, telefone) and table rows: data, motivo_deslocamento, ponto_embarque, ponto_desembarque_teresina, destino_consulta, status_retorno; pipe to buffer and return
- [X] T042 [US5] Add `GET /api/pacientes/:id/relatorio` route to `backend/src/api/pacientes.js`: call `generatePDF`, if null return 204; else set headers `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="relatorio-<nome>-<data>.pdf"` and pipe PDF buffer to response
- [X] T043 [P] [US5] Ensure date filter input in `frontend/src/components/viagens/ViagemLista.jsx` passes `?data=YYYY-MM-DD` query param to `GET /api/viagens`; display empty state message when no trips match the filter
- [X] T044 [US5] Add "Gerar Relatório PDF" button in `frontend/src/components/pacientes/PacienteLista.jsx` per patient row: call `GET /api/pacientes/:id/relatorio` with `responseType: 'blob'`; create object URL and trigger `<a>` download programmatically; handle 204 (no history) with informative message

**Checkpoint**: Date filter shows only matching trips; PDF download for a patient with 3 trip records produces a multi-row PDF with all required columns ordered by date; 204 is gracefully handled with a user-visible message

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality hardening that spans all stories

- [X] T045 [P] Write integration tests for pacientes CRUD in `backend/tests/integration/pacientes.test.js`: use `supertest` with an in-memory or temp SQLite DB; test POST (201 + 409 duplicate CPF + 400 invalid CPF), GET (list + search), PUT, companion upsert
- [X] T046 [P] Write integration tests for viagens + capacity in `backend/tests/integration/viagens.test.js`: test POST (201 + 409 duplicate date), GET with date filter, capacity enforcement at 28 slots with and without companions
- [X] T047 [P] Write integration tests for agendamentos in `backend/tests/integration/agendamentos.test.js`: test full scheduling → presença → retorno flow; test past-trip cancellation block; test state machine rejections
- [X] T048 [P] Add global error handler middleware as last middleware in `backend/src/app.js`: catch uncaught errors, log to stderr, return `500 { "error": "Erro interno do servidor" }` to client
- [X] T049 [P] Security hardening in `backend/src/app.js` and `backend/src/db/seed.js`: read `SESSION_SECRET` from env (throw on missing in production); set `cookie.secure` based on `NODE_ENV`; add login rate-limit (5 attempts/15min) using simple in-memory counter or `express-rate-limit`
- [X] T050 Run `quickstart.md` end-to-end validation: execute all 11 scenarios in order; verify all expected outcomes; document any deviations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Foundational; US1 independent test requires a seeded viagem (seed directly or complete US2 first)
- **US2 (Phase 4)**: Depends on Foundational; can run in parallel with US1 if viagem API is available
- **US3 (Phase 5)**: Depends on US1 (agendamentos exist) + US2 (viagens exist)
- **US4 (Phase 6)**: Depends on US1 (requires existing agendamentos to cancel)
- **US5 (Phase 7)**: Depends on US1 + US2 (needs data to query/report); `relatorioService` depends on US1 patient data
- **Polish (Phase 8)**: Depends on all desired user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — independently testable with a seeded viagem
- **US2 (P1)**: Can start after Foundational — independently testable (no patients needed)
- **US3 (P2)**: Requires US1 + US2 data to exist; adds UI controls to `ViagemDetalhe`
- **US4 (P2)**: Requires US1 + US2 data to exist; adds cancel action to `ViagemDetalhe`
- **US5 (P3)**: Requires historical data from US1 + US2 + US3 to fully validate

### Within Each Phase

- Unit tests (T019–T021, T031) MUST be written and FAIL before implementing the corresponding service
- DB schema (T005) → DB init (T006) → Seed (T007) → Services → Routes
- Services before routes (routes depend on services)
- Backend routes before frontend components (components depend on API contracts)
- Models/services within a story marked [P] can be implemented in parallel

### Parallel Opportunities

```bash
# Phase 2 — run in parallel once T005-T007 are done:
T008 validate.js        T009 cpf.test.js
T010 auth middleware    T014 vite.config.js
T015 api.js (axios)     T016 main.jsx

# Phase 3 — run in parallel after T018:
T019 capacidade.test    T020 estadoPresenca.test    T021 estadoRetorno.test
T022 pacienteService    T024 agendamentoService

# Phase 3 — run in parallel after T022-T025:
T026 PacienteLista      T027 PacienteForm
T028 AcompanhanteForm

# Phase 4 — run in parallel after T031:
T032 viagemService      T033 motoristas routes
T035 ViagemForm         T036 ViagemLista

# Phase 8 — all polish tasks run in parallel:
T045 T046 T047 T048 T049
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only — Both P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Cadastrar + Agendar)
4. Complete Phase 4: User Story 2 (Configurar Viagem)
5. **STOP and VALIDATE**: Test US1 and US2 end-to-end using Cenários 1–6 from `quickstart.md`
6. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready (auth working, DB seeded)
2. US1 → patients can be registered and scheduled
3. US2 → trips can be created with driver rotation
4. US3 → presence and return tracking enabled
5. US4 → cancellations supported (completes P2 scope)
6. US5 → date filtering + PDF reports (P3 scope)
7. Polish → production-grade hardening

### Parallel Team Strategy

With two developers after Foundational phase:

- **Developer A**: US1 backend (T022–T025) → US1 frontend (T026–T030)
- **Developer B**: US2 backend (T031–T034) → US2 frontend (T035–T037)
- Stories integrate cleanly: US1 frontend calls US2's `/api/viagens` to list trips for AgendamentoForm

---

## Notes

- `[P]` tasks touch different files and have no dependency on incomplete peer tasks
- `[USn]` label maps each task to its user story for traceability
- Unit tests for critical logic (CPF, capacity, state machines, escala) MUST fail before implementation (Red-Green-Refactor — Constitution Principle III)
- The `vagas_ocupadas` counter is updated transactionally in `agendamentoService` — never computed on the fly in queries
- CPF is immutable after creation: `PUT /api/pacientes/:id` silently ignores any `cpf` field in the request body
- `better-sqlite3` is synchronous — no async/await needed in service layer
- `ViagemDetalhe` (T038) is extended in US4 (T040) — implement US3's T038 fully before adding T040's cancel button
- Commit after each phase checkpoint; use branch `001-patient-transport-mgmt` per Constitution workflow
