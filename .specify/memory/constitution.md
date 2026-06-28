<!--
RELATÓRIO DE IMPACTO DE SINCRONIZAÇÃO
======================================
Mudança de versão: [TEMPLATE] → 1.0.0 (ratificação inicial)
Princípios modificados: Nenhum (primeira criação a partir do template)
Seções adicionadas: Princípios Fundamentais (5), Stack Tecnológico, Fluxo de Desenvolvimento, Governança
Seções removidas: Nenhuma
Templates que precisam de atualização:
  - .specify/templates/plan-template.md ✅ alinhado (seção de Verificação da Constituição presente, sem referências desatualizadas)
  - .specify/templates/spec-template.md ✅ alinhado (estrutura de histórias de usuário + requisitos compatível)
  - .specify/templates/tasks-template.md ✅ alinhado (estrutura de fases compatível com o princípio MVP-First)
TODOs de acompanhamento:
  - TODO(DATA_RATIFICACAO): Data definida como data de primeiro uso (2026-06-27); confirmar com o dono do projeto se
    uma data de decisão anterior deve ser usada.
-->

# Constituição do MVP SESAM Transportes

## Princípios Fundamentais

### I. MVP-First

Toda funcionalidade DEVE ser delimitada para entregar a menor fatia de valor testável de forma independente.
Nenhuma funcionalidade pode ser construída para uso hipotético futuro. O escopo DEVE ser validado contra a
especificação da funcionalidade ativa antes do início da implementação. Abstrações prematuras, frameworks
genéricos e adições do tipo "podemos precisar disso depois" são proibidos.

**Por quê**: Este é um MVP; velocidade de validação supera elegância arquitetural. Código não utilizado
é um passivo que atrasa a entrega e obscurece os requisitos reais do produto.

### II. API-First

Toda comunicação entre frontend e backend DEVE passar por contratos de API explicitamente definidos
(documentados em `specs/[funcionalidade]/contracts/`). O contrato é a fonte da verdade;
a implementação está em conformidade com o contrato, não o inverso. Os contratos DEVEM ser definidos antes
do início da implementação.

**Por quê**: Os fluxos de gerenciamento de transporte abrangem múltiplas superfícies (aplicativos de motorista,
painéis de despacho, painéis administrativos). Contratos claros permitem desenvolvimento paralelo e evitam acoplamento.

### III. Test-Driven para Lógica Crítica

A lógica de negócio de transporte (roteamento, precificação, agendamento, transições de estado) DEVE ser
coberta por testes escritos antes da implementação. O ciclo Red-Green-Refactor é obrigatório
para esses domínios. Código de interface e configuração não requerem testes antecipados.

**Por quê**: Erros em roteamento ou agendamento têm consequências no mundo real (embarques perdidos,
cobranças incorretas). Os testes codificam as regras de negócio explicitamente e previnem regressões.

### IV. Integridade de Dados Primeiro

Toda entidade que entra no armazenamento persistente DEVE ser validada na fronteira da aplicação
(não apenas na UI). As transições de estado para operações de transporte (ex.: pedido → despachado
→ em trânsito → entregue) DEVEM ser implementadas como máquinas de estado explícitas; atualizações
de status de forma livre são proibidas.

**Por quê**: Dados de transporte impulsionam decisões de logística e faturamento. Estado corrompido ou inconsistente
é mais difícil de recuperar do que uma escrita rejeitada.

### V. Simplicidade — Sem Complexidade Especulativa

Três caminhos de código similares são preferíveis a uma abstração prematura. Padrões de repositório,
barramentos de eventos e divisões de microsserviços são proibidos até que uma necessidade concreta e atual os justifique.
A complexidade DEVE ser documentada na tabela de Rastreamento de Complexidade do plano com uma
justificativa e a alternativa mais simples que foi rejeitada.

**Por quê**: MVPs raramente sobrevivem ao contato com a produção sem mudanças. Arquitetura prematura
bloqueia suposições que se revelam erradas e retarda a capacidade de pivotar.

## Stack Tecnológico

- **Runtime**: Node.js (versão conforme campo `engines` do `package.json` ou LTS mais recente)
- **Linguagem**: JavaScript (TypeScript permitido se a equipe já o utiliza; não migrar
  no meio do projeto)
- **Testes**: Jest (preferido) ou Vitest — um framework, não ambos
- **Estilo de API**: REST a menos que uma funcionalidade específica justifique GraphQL; justificar em `plan.md`
- **Banco de dados**: DEVE ser decidido por funcionalidade; padrão para um único armazenamento relacional
  (PostgreSQL ou SQLite) a menos que exista uma necessidade documentada para outro armazenamento
- **Frontend**: A escolha do framework DEVE ser registrada no `plan.md` da primeira funcionalidade e
  bloqueada para a duração do projeto

## Fluxo de Desenvolvimento

- As funcionalidades DEVEM seguir o fluxo do speckit: `/speckit-specify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`
- Todo PR DEVE referenciar a especificação da funcionalidade e incluir o resultado da Verificação da Constituição
- As especificações ficam em `specs/[###-nome-da-funcionalidade]/`; o código-fonte fica na raiz do repositório
- Os commits DEVEM ser atômicos: uma mudança lógica por commit; fazer squash antes do merge se necessário
- Sem force-pushes para `main`; usar branches de funcionalidade

## Governança

Esta constituição substitui todas as outras práticas de desenvolvimento e acordos informais.
As emendas DEVEM:
1. Identificar o princípio ou seção sendo alterado e o tipo de incremento de versão
2. Documentar por que a constituição atual é insuficiente
3. Ser aplicadas via `/speckit-constitution` e commitadas com a mensagem
   `docs: amend constitution to vX.Y.Z (<motivo>)`

**Política de versionamento**:
- MAJOR: Princípio removido, renomeado ou fundamentalmente redefinido
- MINOR: Novo princípio ou seção adicionado; expansão material de orientação
- PATCH: Esclarecimentos de redação, correções de erros tipográficos, refinamentos não semânticos

Todos os PRs e revisões de código DEVEM verificar conformidade com os cinco Princípios Fundamentais.
Violações de complexidade requerem entradas na tabela de Rastreamento de Complexidade do plano antes
que o PR possa ser mergeado.

**Versão**: 1.0.0 | **Ratificado**: 2026-06-27 | **Última Emenda**: 2026-06-27
