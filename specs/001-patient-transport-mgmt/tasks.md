# Tarefas: Gerenciamento de Transporte de Pacientes SESAM

**Entrada**: Documentos de design em `specs/001-patient-transport-mgmt/`

**Pré-requisitos**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/api.md ✅, research.md ✅, quickstart.md ✅

**Testes**: Testes unitários para lógica de negócio crítica são **obrigatórios** conforme o Princípio III da Constituição (validação de CPF, cálculo de capacidade, máquinas de estado de presença/retorno, escala rotativa). Testes de integração estão incluídos na fase de Polimento.

**Organização**: As tarefas são agrupadas por história de usuário para permitir implementação e testes independentes de cada história.

## Formato: `[ID] [P?] [Historia] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências de tarefas incompletas)
- **[Historia]**: A qual história de usuário esta tarefa pertence (US1–US5)
- Caminhos de arquivo exatos estão incluídos em todas as descrições de tarefas

---

## Fase 1: Configuração (Infraestrutura Compartilhada)

**Propósito**: Inicialização do projeto e estrutura de pastas antes de qualquer código ser escrito

- [X] T001 Criar estrutura de pastas do projeto: `backend/src/{db,services,api,middleware}/`, `backend/tests/{unit,integration}/`, `backend/data/`, `frontend/src/{components/{layout,pacientes,viagens,agendamentos},pages,services}/`
- [X] T002 Inicializar `backend/package.json` com dependências: `express`, `better-sqlite3`, `express-session`, `bcryptjs`, `pdfkit`, `cors`; devDependencies: `jest`, `supertest`; adicionar scripts `"test": "jest"` e `"start": "node server.js"`
- [X] T003 [P] Inicializar `frontend/package.json` com template Vite + React 18; adicionar dependências: `react-router-dom`, `axios`; verificar script `"dev": "vite"`
- [X] T004 [P] Configurar `package.json` raiz com scripts de conveniência: `"dev"` (executa backend + frontend concorrentemente), `"test"` (executa jest do backend), `"db:setup"` (executa `backend/src/db/seed.js`)

**Ponto de Verificação**: Estrutura de pastas existe e todos os pacotes instalam sem erros via `npm install`

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Infraestrutura central — esquema de banco de dados, autenticação, app Express, shell React — da qual TODAS as histórias de usuário dependem

**⚠️ CRÍTICO**: Nenhum trabalho de história de usuário pode começar até que esta fase esteja completa

- [X] T005 Escrever DDL para todas as 5 tabelas em `backend/src/db/schema.sql`: `usuarios`, `pacientes`, `acompanhantes`, `motoristas`, `viagens`, `agendamentos` com tipos de coluna corretos, constraints NOT NULL, constraints UNIQUE e chaves estrangeiras conforme especificado em data-model.md
- [X] T006 Implementar `backend/src/db/index.js`: abrir conexão SQLite em `backend/data/sesam.db`, executar `schema.sql` via `fs.readFileSync` + `db.exec()`, exportar instância singleton `db` usando `better-sqlite3`
- [X] T007 Criar `backend/src/db/seed.js`: inserir motoristas Henrique e Claudio; inserir usuário admin com senha hasheada via bcrypt lida da variável de ambiente `ADMIN_PASSWORD` (padrão `admin123`); usar `INSERT OR IGNORE` para ser idempotente
- [X] T008 [P] Implementar `backend/src/middleware/validate.js`: exportar `validarCPF(cpf)` (algoritmo módulo 11 — remover formatação, verificar 11 dígitos, calcular ambos os dígitos verificadores), array `PONTOS_EMBARQUE` (14 valores da spec), array `PONTOS_DESEMBARQUE_TERESINA` (4 valores: CEIR, Hospital Policial, H.U., São Marcos), array `STATUS_PRESENCA`, array `STATUS_RETORNO`
- [X] T009 [P] Escrever testes unitários para validação de CPF em `backend/tests/unit/cpf.test.js`: testar CPFs válidos (529.982.247-25), dígitos verificadores inválidos, CPFs com todos os dígitos iguais (111.111.111-11), formato incorreto — **devem FALHAR antes de T008 ser implementado**
- [X] T010 [P] Implementar `backend/src/middleware/auth.js`: exportar middleware `requireAuth` que verifica `req.session.userId`; retorna `401 { "error": "Não autenticado" }` se não houver sessão; chama `next()` caso contrário
- [X] T011 Configurar app Express em `backend/src/app.js`: configurar `cors({ origin: 'http://localhost:5173', credentials: true })`, `express.json()`, `express-session` com `secret` da variável de ambiente `SESSION_SECRET`, `resave: false`, `saveUninitialized: false`; comentários de placeholder para montagem dos roteadores
- [X] T012 Criar `backend/server.js`: importar `app` de `./src/app.js`, escutar na variável de ambiente `PORT` (padrão 3001), logar mensagem de pronto
- [X] T013 Implementar rotas de autenticação em `backend/src/api/auth.js`: `POST /login` — consultar `usuarios` por login, comparar senha com `bcryptjs.compare`, definir `req.session.userId` no sucesso, retornar `{ ok: true }` ou `401`; `POST /logout` — chamar `req.session.destroy()`, retornar 204; montar em `/api/auth` em `app.js`
- [X] T014 [P] Configurar `frontend/vite.config.js`: adicionar `server.proxy` para encaminhar requisições `/api` para `http://localhost:3001`
- [X] T015 [P] Criar `frontend/src/services/api.js`: configurar instância axios com `baseURL: '/api'` e `withCredentials: true`; exportar funções nomeadas para cada grupo de endpoint (auth, pacientes, motoristas, viagens, agendamentos)
- [X] T016 [P] Criar `frontend/src/main.jsx`: envolver `<App />` em `<BrowserRouter>`; implementar componente `PrivateRoute` que redireciona usuários não autenticados para `/login` verificando `GET /api/auth/me` ou estado de sessão
- [X] T017 Criar `frontend/src/components/layout/AppShell.jsx`: wrapper de layout com barra de navegação superior contendo links para `/pacientes` e `/viagens`; renderiza `{children}` na área de conteúdo principal; mostrar botão de logout que chama `POST /api/auth/logout` e redireciona para `/login`
- [X] T018 Criar `frontend/src/pages/LoginPage.jsx`: formulário com campos de login e senha; ao enviar chamar `POST /api/auth/login`; no sucesso redirecionar para `/viagens`; exibir mensagem de erro em caso de falha

**Ponto de Verificação**: `npm run db:setup` popula o banco; backend inicia na porta 3001; `POST /api/auth/login` retorna 200; frontend inicia na porta 5173 com página de login visível e redireciona rotas não autenticadas para `/login`

---

## Fase 3: História de Usuário 1 — Cadastrar e Agendar Paciente em Viagem (Prioridade: P1) 🎯 MVP

**Objetivo**: O administrativo pode cadastrar um paciente com acompanhante opcional, e então agendar esse paciente em uma viagem existente com validação de capacidade.

**Teste Independente**: Criar um paciente, popular uma viagem via insert direto no banco (ou completar US2 primeiro), agendar o paciente na viagem; verificar contagem de capacidade e bloqueio em 28 vagas.

### Testes de Lógica Crítica para a História de Usuário 1 (Princípio III da Constituição — escrever antes da implementação)

> **NOTA: Escrever estes testes PRIMEIRO — devem FALHAR antes que os serviços correspondentes sejam implementados**

- [X] T019 [P] [US1] Escrever testes unitários de capacidade em `backend/tests/unit/capacidade.test.js`: testar `calcularVagasAgendamento(acompanhante)` retorna 1 (sem acompanhante) ou 2 (acompanhante com `ocupa_vaga=true`); testar que o agendamento falha quando `vagas_ocupadas + vagas_necessarias > 28`; testar limite exatamente em 28 vagas
- [X] T020 [P] [US1] Escrever testes unitários da máquina de estado de presença em `backend/tests/unit/estadoPresenca.test.js`: `Pendente → Presente` permitido; `Pendente → Faltou` permitido; `Presente → Pendente` rejeitado; `Faltou → Pendente` rejeitado; `Faltou → Presente` rejeitado
- [X] T021 [P] [US1] Escrever testes unitários da máquina de estado de retorno em `backend/tests/unit/estadoRetorno.test.js`: `Pendente → Voltou no Dia` permitido somente quando `status_presenca = Presente`; `Pendente → Ficou em Teresina` permitido; `Pendente → Voltou por Conta Própria` permitido; todas as transições rejeitadas quando `status_presenca = Faltou`

### Implementação para a História de Usuário 1

- [X] T022 [P] [US1] Implementar `backend/src/services/pacienteService.js`: `createPaciente(data)` — validar CPF com `validarCPF`, verificar `ponto_embarque` na lista fixa, inserir no banco, lançar exceção em CPF duplicado com código 409; `getPacientes(q)` — consultar com busca opcional por substring de nome/CPF, join `acompanhantes`; `getPacienteById(id)`; `updatePaciente(id, data)` — bloquear alterações de CPF; `upsertAcompanhante(pacienteId, data)` — INSERT OR REPLACE; `deleteAcompanhante(pacienteId)`
- [X] T023 [US1] Implementar `backend/src/api/pacientes.js`: rotas `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `PUT /:id/acompanhante`, `DELETE /:id/acompanhante` — todas protegidas por `requireAuth`; mapear erros do serviço para códigos HTTP corretos (400, 404, 409); montar em `/api/pacientes` em `backend/src/app.js`
- [X] T024 [P] [US1] Implementar `backend/src/services/agendamentoService.js`: `createAgendamento(viagemId, data)` — verificar se a viagem existe, validar `ponto_desembarque_teresina` na lista fixa, calcular `vagas_necessarias` (1 ou 2 com base em `ocupa_vaga` do acompanhante), verificar capacidade em transação SQLite única, inserir agendamento e atualizar `viagens.vagas_ocupadas`; `cancelAgendamento(id)` — verificar se data da viagem >= hoje (senão 400), deletar agendamento e decrementar `vagas_ocupadas` em transação; `updatePresenca(id, status)` — validar transição da máquina de estado; `updateRetorno(id, status)` — validar pré-condição `status_presenca = Presente` e transição da máquina de estado
- [X] T025 [US1] Implementar `backend/src/api/agendamentos.js`: `POST /api/viagens/:viagem_id/agendamentos`, `DELETE /api/agendamentos/:id`, `PATCH /api/agendamentos/:id/presenca`, `PATCH /api/agendamentos/:id/retorno` — todos protegidos por `requireAuth`; montar ambos os grupos de rotas em `backend/src/app.js`
- [X] T026 [P] [US1] Criar `frontend/src/components/pacientes/PacienteLista.jsx`: tabela listando todos os pacientes com colunas nome, CPF, ponto_embarque, prioridade; campo de busca chamando `GET /api/pacientes?q=`; ações por linha: Editar, Gerar PDF (chama `GET /api/pacientes/:id/relatorio` e aciona download)
- [X] T027 [P] [US1] Criar `frontend/src/components/pacientes/PacienteForm.jsx`: formulário para criação e edição com campos: nome, CPF (desabilitado na edição), telefone, ponto_embarque `<select>` (14 opções da lista fixa), prioridade radio (Alta/Normal); ao enviar chamar `POST /api/pacientes` ou `PUT /api/pacientes/:id`; exibir erro de validação inline para CPF e conflitos 409
- [X] T028 [P] [US1] Criar `frontend/src/components/pacientes/AcompanhanteForm.jsx`: subformulário incorporado na tela de edição do paciente; campos: nome, checkbox ocupa_vaga; botões Salvar e Remover; chama `PUT /api/pacientes/:id/acompanhante` ou `DELETE /api/pacientes/:id/acompanhante`
- [X] T029 [US1] Criar `frontend/src/pages/PacientesPage.jsx`: renderiza `PacienteLista` por padrão; mostra `PacienteForm` em modal ou painel lateral para criação/edição; inclui `AcompanhanteForm` dentro do painel de edição; registrar rota `/pacientes` em `frontend/src/main.jsx`
- [X] T030 [US1] Criar `frontend/src/components/agendamentos/AgendamentoForm.jsx`: modal ou formulário inline dentro da tela de detalhe da viagem; campos: seletor de paciente `<select>` (filtrado por busca via `GET /api/pacientes?q=`), textarea motivo_deslocamento, `<select>` ponto_desembarque_teresina (4 opções), input destino_consulta; ao enviar chamar `POST /api/viagens/:id/agendamentos`; exibir erro de capacidade 409 em português

**Ponto de Verificação**: O administrativo pode cadastrar um paciente com acompanhante, abrir uma viagem existente, agendar o paciente e ver 2/28 vagas consumidas; agendar 28 pacientes bloqueia adições posteriores com mensagem de erro clara

---

## Fase 4: História de Usuário 2 — Configurar Viagem (Motorista e Veículo) (Prioridade: P1)

**Objetivo**: O administrativo pode criar uma viagem diária, atribuir um motorista a partir da sugestão de escala rotativa e registrar placa/modelo do veículo.

**Teste Independente**: Criar duas viagens consecutivas e verificar que a sugestão de motorista alterna entre Henrique e Claudio; verificar bloqueio de data duplicada.

### Teste de Lógica Crítica para a História de Usuário 2 (Princípio III da Constituição)

- [X] T031 [P] [US2] Escrever testes unitários para escala rotativa em `backend/tests/unit/escalaRotativa.test.js`: dada nenhuma viagem anterior → sugerir motorista id 1; dada última viagem com motorista id 1 → sugerir id 2; dada última viagem com motorista id 2 → sugerir id 1; testar a função de cálculo puro de forma isolada

### Implementação para a História de Usuário 2

- [X] T032 [P] [US2] Implementar `backend/src/services/viagemService.js`: `createViagem(data)` — validar `data` como data ISO, verificar constraint UNIQUE em `data` (409 se duplicada), inserir viagem; `getViagens(dateFilter)` — consultar todas as viagens ordenadas por data desc, WHERE date = filtro opcional, LEFT JOIN agendamentos com pacientes; `getViagemById(id)` — mesmo join, 404 se não encontrada; `updateViagem(id, data)` — atualização parcial de motorista_id, placa, modelo_veiculo; `getSugestaoEscala()` — consultar última viagem por data desc, retornar motorista_id oposto (ou id 1 se não houver)
- [X] T033 [P] [US2] Implementar `backend/src/api/motoristas.js`: `GET /api/motoristas` — listar ambos os motoristas + chamar `getSugestaoEscala()` para calcular `sugestao_escala_id`; montar em `/api/motoristas` em `backend/src/app.js`
- [X] T034 [US2] Implementar `backend/src/api/viagens.js`: `POST /api/viagens`, `GET /api/viagens`, `GET /api/viagens/:id`, `PUT /api/viagens/:id` — todos protegidos por `requireAuth`; montar em `/api/viagens` em `backend/src/app.js`
- [X] T035 [P] [US2] Criar `frontend/src/components/viagens/ViagemForm.jsx`: formulário com input de data, `<select>` de motorista (busca `GET /api/motoristas`, destaca motorista sugerido com rótulo "(sugerido)"), input de placa, input de modelo_veiculo; ao enviar chamar `POST /api/viagens`; exibir erro de data duplicada 409 em português
- [X] T036 [P] [US2] Criar `frontend/src/components/viagens/ViagemLista.jsx`: lista de viagens com data, nome do motorista, `vagas_ocupadas/28`, placa; input de filtro por data chamando `GET /api/viagens?data=`; cada linha linka para `/viagens/:id`; botão "Nova Viagem" abre `ViagemForm`
- [X] T037 [US2] Criar `frontend/src/pages/ViagensPage.jsx`: renderiza `ViagemLista`; registrar rota `/viagens` em `frontend/src/main.jsx`; registrar rota filha `/viagens/:id` apontando para `ViagemDetalhe` (a ser implementado em US3)

**Ponto de Verificação**: O administrativo pode criar uma viagem para amanhã, ver a sugestão de motorista alternando na segunda viagem, registrar dados do veículo e ser bloqueado ao criar uma segunda viagem na mesma data

---

## Fase 5: História de Usuário 3 — Registrar Presença e Status de Retorno (Prioridade: P2)

**Objetivo**: O administrativo pode visualizar a lista de passageiros da viagem e marcar cada paciente como presente/faltante; registrar status de retorno para pacientes presentes.

**Teste Independente**: Com viagem + agendamentos existentes (de US1+US2), abrir detalhe da viagem, marcar um paciente como Presente, depois definir status de retorno como "Voltou no Dia"; verificar estado bloqueado quando status do paciente é "Faltou".

- [X] T038 [US3] Criar `frontend/src/components/viagens/ViagemDetalhe.jsx`: buscar `GET /api/viagens/:id`; renderizar cabeçalho da viagem (data, motorista, vagas, placa/modelo); renderizar tabela de passageiros com colunas: nome, ponto_embarque, prioridade, motivo; controle de presença — grupo de radio (Pendente/Presente/Faltou) chamando `PATCH /api/agendamentos/:id/presenca`; controle de retorno — `<select>` (desabilitado se `status_presenca ≠ Presente`) chamando `PATCH /api/agendamentos/:id/retorno`; também renderiza `AgendamentoForm` via botão "Agendar Paciente"
- [X] T039 [US3] Conectar `ViagemDetalhe` à rota `/viagens/:id` em `frontend/src/pages/ViagensPage.jsx`; garantir que as linhas de viagem em `ViagemLista` naveguem para esta rota

**Ponto de Verificação**: O administrativo abre a tela de detalhe de uma viagem, vê todos os pacientes agendados, marca presença e retorno, e é bloqueado ao tentar definir retorno para um paciente marcado como Faltou

---

## Fase 6: História de Usuário 4 — Cancelar Agendamento (Prioridade: P2)

**Objetivo**: O administrativo pode cancelar um paciente agendado em uma viagem futura, restaurando as vagas liberadas na contagem de disponibilidade da viagem.

**Teste Independente**: Cancelar um agendamento existente em uma viagem futura e verificar que `vagas_ocupadas` decrementa corretamente (em 1 ou 2 dependendo do acompanhante); verificar que o cancelamento em viagem passada é bloqueado.

- [X] T040 [US4] Adicionar botão "Cancelar" por linha de passageiro em `frontend/src/components/viagens/ViagemDetalhe.jsx`: ao clicar mostrar diálogo de confirmação; chamar `DELETE /api/agendamentos/:id`; no sucesso atualizar dados da viagem para mostrar `vagas_ocupadas` atualizado; exibir mensagem de erro 400 quando a viagem já passou ("Não é possível cancelar agendamentos de viagens já realizadas")

**Ponto de Verificação**: Cancelar um agendamento futuro (com acompanhante ocupando 2 vagas) reduz o contador da viagem de 2 para 0; tentar cancelar um agendamento de viagem passada exibe a mensagem de bloqueio

---

## Fase 7: História de Usuário 5 — Consultar Viagens e Gerar Relatório PDF (Prioridade: P3)

**Objetivo**: O administrativo pode filtrar viagens por data para ver o status dos passageiros, e fazer download de um PDF com o histórico completo de viagens de qualquer paciente.

**Teste Independente**: Filtrar viagens por uma data específica, verificar que apenas a viagem daquela data aparece com todos os dados dos passageiros; gerar PDF para um paciente com múltiplos registros de viagem, verificar que o PDF contém todos os campos obrigatórios ordenados por data.

- [X] T041 [US5] Implementar `backend/src/services/relatorioService.js`: `generatePDF(pacienteId)` — consultar paciente + todos os agendamentos com dados da viagem ordenados por data asc; se não houver agendamentos retornar null; usar `pdfkit` para criar PDF com cabeçalho do paciente (nome, CPF, telefone) e linhas da tabela: data, motivo_deslocamento, ponto_embarque, ponto_desembarque_teresina, destino_consulta, status_retorno; enviar para buffer e retornar
- [X] T042 [US5] Adicionar rota `GET /api/pacientes/:id/relatorio` em `backend/src/api/pacientes.js`: chamar `generatePDF`, se null retornar 204; caso contrário definir headers `Content-Type: application/pdf` e `Content-Disposition: attachment; filename="relatorio-<nome>-<data>.pdf"` e enviar buffer do PDF na resposta
- [X] T043 [P] [US5] Garantir que o input de filtro por data em `frontend/src/components/viagens/ViagemLista.jsx` passa o parâmetro `?data=YYYY-MM-DD` para `GET /api/viagens`; exibir mensagem de estado vazio quando nenhuma viagem corresponder ao filtro
- [X] T044 [US5] Adicionar botão "Gerar Relatório PDF" em `frontend/src/components/pacientes/PacienteLista.jsx` por linha de paciente: chamar `GET /api/pacientes/:id/relatorio` com `responseType: 'blob'`; criar URL do objeto e acionar download via `<a>` programaticamente; tratar 204 (sem histórico) com mensagem informativa

**Ponto de Verificação**: Filtro por data mostra apenas viagens correspondentes; download do PDF para um paciente com 3 registros de viagem produz um PDF com múltiplas linhas e todas as colunas obrigatórias ordenadas por data; 204 é tratado graciosamente com mensagem visível ao usuário

---

## Fase 8: Polimento e Aspectos Transversais

**Propósito**: Endurecimento de qualidade abrangendo todas as histórias

- [X] T045 [P] Escrever testes de integração para CRUD de pacientes em `backend/tests/integration/pacientes.test.js`: usar `supertest` com banco SQLite em memória ou temporário; testar POST (201 + 409 CPF duplicado + 400 CPF inválido), GET (lista + busca), PUT, upsert de acompanhante
- [X] T046 [P] Escrever testes de integração para viagens + capacidade em `backend/tests/integration/viagens.test.js`: testar POST (201 + 409 data duplicada), GET com filtro de data, imposição de capacidade em 28 vagas com e sem acompanhantes
- [X] T047 [P] Escrever testes de integração para agendamentos em `backend/tests/integration/agendamentos.test.js`: testar fluxo completo de agendamento → presença → retorno; testar bloqueio de cancelamento em viagem passada; testar rejeições da máquina de estado
- [X] T048 [P] Adicionar middleware de tratamento global de erros como último middleware em `backend/src/app.js`: capturar erros não tratados, logar em stderr, retornar `500 { "error": "Erro interno do servidor" }` ao cliente
- [X] T049 [P] Endurecimento de segurança em `backend/src/app.js` e `backend/src/db/seed.js`: ler `SESSION_SECRET` do env (lançar exceção se ausente em produção); definir `cookie.secure` com base em `NODE_ENV`; adicionar rate-limit de login (5 tentativas/15min) usando contador simples em memória ou `express-rate-limit`
- [X] T050 Executar validação de ponta a ponta do `quickstart.md`: executar todos os 11 cenários em ordem; verificar todos os resultados esperados; documentar quaisquer desvios

---

## Dependências e Ordem de Execução

### Dependências de Fase

- **Configuração (Fase 1)**: Sem dependências — iniciar imediatamente
- **Fundação (Fase 2)**: Depende da conclusão da Fase 1 — **BLOQUEIA todas as histórias de usuário**
- **US1 (Fase 3)**: Depende da Fundação; teste independente de US1 requer uma viagem populada (inserir diretamente ou completar US2 primeiro)
- **US2 (Fase 4)**: Depende da Fundação; pode executar em paralelo com US1 se a API de viagens estiver disponível
- **US3 (Fase 5)**: Depende de US1 (agendamentos existem) + US2 (viagens existem)
- **US4 (Fase 6)**: Depende de US1 (requer agendamentos existentes para cancelar)
- **US5 (Fase 7)**: Depende de US1 + US2 (precisa de dados para consultar/reportar); `relatorioService` depende dos dados de pacientes de US1
- **Polimento (Fase 8)**: Depende de todas as histórias de usuário desejadas concluídas

### Dependências entre Histórias de Usuário

- **US1 (P1)**: Pode iniciar após a Fundação — testável de forma independente com viagem populada
- **US2 (P1)**: Pode iniciar após a Fundação — testável de forma independente (sem pacientes necessários)
- **US3 (P2)**: Requer dados de US1 + US2 para existir; adiciona controles de UI ao `ViagemDetalhe`
- **US4 (P2)**: Requer dados de US1 + US2 para existir; adiciona ação de cancelamento ao `ViagemDetalhe`
- **US5 (P3)**: Requer dados históricos de US1 + US2 + US3 para validação completa

### Dentro de Cada Fase

- Testes unitários (T019–T021, T031) DEVEM ser escritos e FALHAR antes de implementar o serviço correspondente
- Esquema do banco (T005) → inicialização do banco (T006) → Seed (T007) → Serviços → Rotas
- Serviços antes das rotas (rotas dependem dos serviços)
- Rotas do backend antes dos componentes do frontend (componentes dependem dos contratos de API)
- Modelos/serviços dentro de uma história marcados com [P] podem ser implementados em paralelo

### Oportunidades de Paralelização

```bash
# Fase 2 — executar em paralelo após T005-T007:
T008 validate.js        T009 cpf.test.js
T010 middleware auth    T014 vite.config.js
T015 api.js (axios)     T016 main.jsx

# Fase 3 — executar em paralelo após T018:
T019 capacidade.test    T020 estadoPresenca.test    T021 estadoRetorno.test
T022 pacienteService    T024 agendamentoService

# Fase 3 — executar em paralelo após T022-T025:
T026 PacienteLista      T027 PacienteForm
T028 AcompanhanteForm

# Fase 4 — executar em paralelo após T031:
T032 viagemService      T033 rotas motoristas
T035 ViagemForm         T036 ViagemLista

# Fase 8 — todas as tarefas de polimento executam em paralelo:
T045 T046 T047 T048 T049
```

---

## Estratégia de Implementação

### MVP Primeiro (Apenas Histórias de Usuário 1 + 2 — Ambas P1)

1. Completar Fase 1: Configuração
2. Completar Fase 2: Fundação (CRÍTICO — bloqueia todas as histórias)
3. Completar Fase 3: História de Usuário 1 (Cadastrar + Agendar)
4. Completar Fase 4: História de Usuário 2 (Configurar Viagem)
5. **PARAR E VALIDAR**: Testar US1 e US2 de ponta a ponta usando Cenários 1–6 do `quickstart.md`
6. Fazer deploy/demo do MVP

### Entrega Incremental

1. Configuração + Fundação → Base pronta (autenticação funcionando, banco populado)
2. US1 → pacientes podem ser cadastrados e agendados
3. US2 → viagens podem ser criadas com rodízio de motorista
4. US3 → controle de presença e retorno habilitado
5. US4 → cancelamentos suportados (completa o escopo P2)
6. US5 → filtragem por data + relatórios PDF (escopo P3)
7. Polimento → endurecimento para produção

### Estratégia de Equipe Paralela

Com dois desenvolvedores após a fase de Fundação:

- **Desenvolvedor A**: Backend US1 (T022–T025) → Frontend US1 (T026–T030)
- **Desenvolvedor B**: Backend US2 (T031–T034) → Frontend US2 (T035–T037)
- As histórias integram de forma limpa: o frontend de US1 chama `/api/viagens` de US2 para listar viagens no `AgendamentoForm`

---

## Notas

- Tarefas com `[P]` afetam arquivos diferentes e não têm dependência de tarefas paralelas incompletas
- O rótulo `[USn]` mapeia cada tarefa para sua história de usuário para rastreabilidade
- Testes unitários para lógica crítica (CPF, capacidade, máquinas de estado, escala) DEVEM falhar antes da implementação (Red-Green-Refactor — Princípio III da Constituição)
- O contador `vagas_ocupadas` é atualizado transacionalmente em `agendamentoService` — nunca calculado dinamicamente em consultas
- O CPF é imutável após a criação: `PUT /api/pacientes/:id` ignora silenciosamente qualquer campo `cpf` no corpo da requisição
- `better-sqlite3` é síncrono — async/await não é necessário na camada de serviço
- `ViagemDetalhe` (T038) é estendido em US4 (T040) — implementar completamente T038 de US3 antes de adicionar o botão de cancelamento de T040
- Fazer commit após cada ponto de verificação de fase; usar branch `001-patient-transport-mgmt` conforme fluxo da Constituição
