# Feature Specification: Gerenciamento de Transporte de Pacientes SESAM

**Feature Branch**: `001-patient-transport-mgmt`

**Created**: 2026-06-27

**Status**: Draft

**Input**: Sistema completo de gerenciamento de transportes de pacientes da SESAM com cadastro de pacientes, agendamento em viagens, controle de presença e geração de relatórios.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar e Agendar Paciente em Viagem (Priority: P1)

O administrativo precisa cadastrar um novo paciente com seus dados e, em seguida, agendá-lo em uma viagem já existente, informando o motivo do deslocamento e o ponto de desembarque em Teresina.

**Why this priority**: É o fluxo central do sistema — sem ele nenhuma outra funcionalidade faz sentido. Representa o ciclo completo de atendimento a um paciente.

**Independent Test**: Pode ser testado de forma isolada criando um paciente, uma viagem e realizando o agendamento — verifica cadastro, vinculação de acompanhante, validação de capacidade e registro do destino.

**Acceptance Scenarios**:

1. **Given** o administrativo está na tela de cadastro de paciente, **When** preenche nome, CPF válido, telefone e seleciona um ponto de embarque da lista fixa, **Then** o paciente é salvo e aparece na listagem de pacientes.
2. **Given** um paciente cadastrado e uma viagem com vagas disponíveis, **When** o administrativo agenda o paciente informando motivo do deslocamento, ponto de desembarque e destino real da consulta, **Then** o agendamento é criado e a contagem de vagas da viagem é atualizada.
3. **Given** uma viagem com 28 vagas preenchidas, **When** o administrativo tenta agendar mais um paciente, **Then** o sistema impede o agendamento e exibe mensagem de capacidade máxima atingida.
4. **Given** um paciente sendo agendado com um acompanhante (que ocupa vaga), **When** o agendamento é confirmado, **Then** o sistema conta 2 vagas utilizadas (paciente + acompanhante) e valida a capacidade total.
5. **Given** um paciente com prioridade Alta (oncológico), **When** o paciente é listado em uma viagem, **Then** sua prioridade é visível no agendamento.

---

### User Story 2 - Configurar Viagem (Motorista e Veículo) (Priority: P1)

O administrativo precisa criar uma viagem para uma data específica e associar motorista e veículo, gerenciando a escala rotativa entre os motoristas disponíveis.

**Why this priority**: A viagem é o objeto central ao qual todos os agendamentos se vinculam. Sem a viagem configurada, não é possível agendar pacientes.

**Independent Test**: Pode ser testado criando uma viagem, selecionando motorista e cadastrando placa/modelo do veículo — verifica criação da viagem e associação dos dados operacionais.

**Acceptance Scenarios**:

1. **Given** o administrativo vai criar uma nova viagem, **When** informa a data e seleciona um motorista da lista disponível, **Then** a viagem é criada com status "Aguardando" e o motorista fica registrado.
2. **Given** uma viagem criada, **When** o administrativo registra placa e modelo do veículo, **Then** os dados do veículo ficam salvos e associados à viagem.
3. **Given** a lista de motoristas disponíveis, **When** o administrativo abre a tela de seleção de motorista, **Then** o sistema indica qual motorista está na vez na escala rotativa (baseado na viagem anterior).
4. **Given** duas viagens consecutivas, **When** o administrativo verifica a sugestão de escala, **Then** motoristas alternam entre as viagens (Motorista A → Motorista B → Motorista A...).

---

### User Story 3 - Registrar Presença e Status de Retorno (Priority: P2)

O administrativo registra, no dia da viagem, quais pacientes estiveram presentes e, após o retorno, o status de retorno de cada paciente.

**Why this priority**: Fundamental para o controle operacional, mas depende das User Stories 1 e 2 estarem funcionando.

**Independent Test**: Pode ser testado em uma viagem com agendamentos existentes — marca presença/falta e registra retorno dos pacientes.

**Acceptance Scenarios**:

1. **Given** uma viagem com pacientes agendados, **When** o administrativo abre a lista de passageiros e marca presença de um paciente, **Then** o status do paciente na viagem muda para "Presente".
2. **Given** uma viagem com pacientes agendados, **When** o administrativo marca falta de um paciente, **Then** o status muda para "Faltou".
3. **Given** um paciente marcado como presente em uma viagem, **When** o administrativo registra o status de retorno como "Voltou no dia", **Then** o registro de retorno é salvo e o histórico do paciente é atualizado.
4. **Given** um paciente que ficou em Teresina, **When** o administrativo registra "Ficou em Teresina", **Then** o sistema salva esse status e o paciente aparece como pendente de retorno.
5. **Given** um paciente que voltou por conta própria, **When** o administrativo registra "Voltou por conta própria", **Then** o status é salvo com essa descrição.

---

### User Story 4 - Cancelar Agendamento (Priority: P2)

O administrativo precisa cancelar o agendamento de um paciente em uma viagem específica, liberando a(s) vaga(s) correspondente(s).

**Why this priority**: Operacionalmente necessário, mas é uma função secundária ao fluxo de agendamento.

**Independent Test**: Pode ser testado cancelando um agendamento existente e verificando que a contagem de vagas volta ao estado anterior.

**Acceptance Scenarios**:

1. **Given** um paciente agendado em uma viagem, **When** o administrativo cancela o agendamento, **Then** o agendamento é removido e a(s) vaga(s) liberada(s) reflete na contagem da viagem.
2. **Given** um paciente agendado com acompanhante, **When** o administrativo cancela o agendamento, **Then** 2 vagas são liberadas (paciente + acompanhante).
3. **Given** uma viagem que já foi realizada (passada), **When** o administrativo tenta cancelar um agendamento, **Then** o sistema impede o cancelamento e exibe mensagem explicativa.

---

### User Story 5 - Consultar Viagens e Gerar Relatório PDF (Priority: P3)

O administrativo consulta a lista de viagens por data, visualiza os passageiros e seus status, e gera um relatório PDF do histórico de viagens de um paciente específico.

**Why this priority**: Funcionalidade de consulta e relatório; agrega valor mas não bloqueia operação diária.

**Independent Test**: Pode ser testado listando viagens por uma data e gerando PDF do histórico de um paciente — verifica filtragem e exportação.

**Acceptance Scenarios**:

1. **Given** viagens cadastradas em datas diferentes, **When** o administrativo filtra por uma data específica, **Then** apenas as viagens daquela data são exibidas com seus passageiros e status.
2. **Given** a listagem de uma viagem, **When** o administrativo visualiza os passageiros, **Then** cada passageiro exibe nome, ponto de embarque, prioridade e status de presença/retorno.
3. **Given** um paciente com histórico de viagens, **When** o administrativo solicita o relatório PDF, **Then** um PDF é gerado contendo todas as viagens do paciente com datas, motivos, pontos de desembarque e status de retorno.
4. **Given** o relatório PDF gerado, **When** o administrativo abre o arquivo, **Then** o relatório é legível, ordenado por data e contém todos os campos relevantes.

---

### Edge Cases

- O que acontece se o CPF do paciente já estiver cadastrado?
- O que acontece se o administrativo tentar registrar retorno antes de marcar presença?
- O que acontece com as vagas de acompanhante se o próprio paciente cancelar (acompanhante deve ser cancelado junto)?
- O que acontece se não houver nenhuma viagem anterior para calcular a escala rotativa de motoristas?
- Paciente pode ser agendado em mais de uma viagem no mesmo dia?

---

## Requirements *(mandatory)*

### Functional Requirements

**Cadastro de Pacientes**
- **FR-001**: O sistema DEVE permitir cadastrar paciente com nome completo, CPF (único no sistema), telefone e ponto de embarque selecionado de lista fixa pré-definida.
- **FR-002**: O sistema DEVE validar o CPF informado (formato e unicidade) antes de salvar o paciente.
- **FR-003**: O sistema DEVE permitir vincular ao paciente um acompanhante com nome, marcando que ocupa uma vaga.
- **FR-004**: O sistema DEVE permitir definir a prioridade do paciente como "Alta" (oncológico) ou "Normal".
- **FR-005**: O sistema DEVE permitir editar os dados cadastrais de um paciente.

**Pontos de Embarque disponíveis** (lista fixa):
SESAM, Praça da Bandeira, Sorveteria Cremosa, Memorial Espedito Resende, Vida Animal, Posto São Francisco, Posto Piripiri, Posto Petrolina, M. Sales, ELECNOR, Chico Jovem, Lili Doces, Entrada da Malhadinha, Capela da Várzea.

**Gerenciamento de Viagens**
- **FR-006**: O sistema DEVE permitir criar uma viagem para uma data específica.
- **FR-007**: O sistema DEVE permitir associar um motorista (selecionado manualmente de uma lista com 2 motoristas cadastrados) a uma viagem.
- **FR-008**: O sistema DEVE indicar ao administrativo qual motorista está na vez na escala rotativa, alternando entre os 2 motoristas a cada viagem.
- **FR-009**: O sistema DEVE permitir registrar placa e modelo do veículo na viagem.
- **FR-010**: O sistema DEVE controlar a capacidade máxima da viagem em 28 vagas totais (pacientes + acompanhantes que ocupam vaga).

**Agendamento**
- **FR-011**: O sistema DEVE permitir agendar um paciente cadastrado em uma viagem disponível.
- **FR-012**: O sistema DEVE exigir, no agendamento, o motivo do deslocamento (texto livre).
- **FR-013**: O sistema DEVE exigir, no agendamento, o ponto de desembarque em Teresina (lista fixa: CEIR, Hospital Policial, H.U., São Marcos) e o destino real da consulta (texto livre).
- **FR-014**: O sistema DEVE impedir o agendamento quando a viagem atingir 28 vagas.
- **FR-015**: O sistema DEVE permitir cancelar o agendamento de um paciente em uma viagem futura, liberando as vagas correspondentes.
- **FR-016**: O sistema DEVE impedir cancelamento de agendamentos em viagens já realizadas.

**Controle Operacional**
- **FR-017**: O sistema DEVE permitir marcar presença ("Presente") ou falta ("Faltou") de cada paciente agendado em uma viagem.
- **FR-018**: O sistema DEVE permitir registrar o status de retorno do paciente: "Voltou no dia", "Ficou em Teresina" ou "Voltou por conta própria".

**Consulta e Relatório**
- **FR-019**: O sistema DEVE listar viagens filtrando por data, exibindo passageiros e respectivos status de presença e retorno.
- **FR-020**: O sistema DEVE gerar um relatório em PDF com o histórico de viagens de um paciente específico, contendo data, motivo, ponto de embarque, ponto de desembarque, destino real e status de retorno.

### Key Entities *(include if feature involves data)*

- **Paciente**: Pessoa transportada. Atributos: nome, CPF (único), telefone, ponto de embarque (lista fixa), prioridade (Alta/Normal).
- **Acompanhante**: Pessoa vinculada a um paciente. Atributos: nome, flag de ocupação de vaga. Pertence a um único Paciente.
- **Motorista**: Condutor do veículo. Atributos: nome. Exatamente 2 motoristas no sistema (MVP).
- **Viagem**: Evento de transporte. Atributos: data, motorista, placa do veículo, modelo do veículo, capacidade máxima (28 vagas fixas), vagas ocupadas.
- **Agendamento**: Vínculo entre Paciente e Viagem. Atributos: motivo do deslocamento (texto), ponto de desembarque em Teresina (lista fixa), destino real da consulta (texto), status de presença (Presente/Faltou/Pendente), status de retorno (Voltou no dia/Ficou em Teresina/Voltou por conta própria/Pendente).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O administrativo consegue cadastrar um paciente e agendá-lo em uma viagem em menos de 3 minutos.
- **SC-002**: O sistema impede 100% das tentativas de agendamento que ultrapassem 28 vagas por viagem.
- **SC-003**: O relatório PDF de um paciente é gerado e está disponível para download em menos de 10 segundos.
- **SC-004**: Todas as viagens do dia são acessadas em até 2 cliques a partir da tela inicial.
- **SC-005**: 100% dos agendamentos cancelados liberam corretamente as vagas (1 para paciente sem acompanhante, 2 para paciente com acompanhante que ocupa vaga).
- **SC-006**: O histórico completo de viagens de qualquer paciente é acessível sem filtragem adicional além da seleção do paciente.

---

## Assumptions

- O sistema é utilizado exclusivamente por usuários administrativos da SESAM — não há portal do paciente nem acesso por motoristas no MVP.
- Autenticação simples por login/senha para o administrativo; controle de acesso por função está fora do escopo do MVP.
- A frota no MVP consiste em um único veículo operando por dia; cada data tem no máximo uma viagem registrada.
- A escala rotativa de motoristas é baseada na última viagem registrada no sistema; se não houver viagem anterior, o sistema sugere o Motorista 1 como padrão.
- Um paciente pode ter apenas um acompanhante por agendamento.
- O CPF é o identificador único do paciente; edições de CPF não são permitidas (para alteração de CPF, novo cadastro deve ser criado).
- O PDF de relatório é gerado no momento da solicitação e não é armazenado — o administrativo faz o download imediatamente.
- Suporte apenas ao idioma português do Brasil.
- O sistema opera em ambiente web (navegador desktop) — acesso mobile não é requisito do MVP.
