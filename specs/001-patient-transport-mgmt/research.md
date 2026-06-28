# Research: Gerenciamento de Transporte de Pacientes SESAM

**Feature**: 001-patient-transport-mgmt
**Date**: 2026-06-27

---

## Decisão 1: Arquitetura Geral

**Decisão**: Web application com backend REST API (Node.js/Express) e frontend SPA (React).

**Justificativa**: O spec exige interface web para usuário administrador, geração de PDF no servidor e dados relacionais (pacientes, viagens, agendamentos). A separação backend/frontend permite que os contratos de API sejam definidos antes da implementação (Princípio II da Constituição). Express é a escolha mais simples disponível no ecossistema Node.js e não exige configuração extra.

**Alternativas consideradas**:
- Fullstack monolítico (Express + templates EJS/Handlebars): descartado pois misturaria lógica de apresentação e negócio, dificultando a definição de contratos de API independentes.
- Next.js: descartado por ser uma camada de complexidade desnecessária para um MVP admin interno (YAGNI, Princípio V).

---

## Decisão 2: Framework Frontend

**Decisão**: React (com Vite como bundler).

**Justificativa**: A interface requer atualizações dinâmicas (contador de vagas em tempo real, formulários multi-etapa) que são trabalhosas com HTML/JS puro. React é amplamente conhecido, tem ecossistema maduro, e Vite oferece DX rápida sem boilerplate excessivo.

**Fixado**: Conforme Princípio V da Constituição, o framework frontend é bloqueado neste plano para toda a duração do projeto.

**Alternativas consideradas**:
- HTML/JS puro: viável mas custoso em manutenção para formulários interativos com validação de capacidade em tempo real.
- Vue.js: igualmente válido, mas React tem maior familiaridade geral.

---

## Decisão 3: Banco de Dados

**Decisão**: SQLite via `better-sqlite3`.

**Justificativa**: MVP com volume pequeno (dezenas de pacientes, uma viagem por dia). SQLite não requer servidor de banco de dados separado — o arquivo `.db` é incluído no deploy. `better-sqlite3` oferece API síncrona simples, sem overhead de gerenciamento de pool de conexões.

**Alternativas consideradas**:
- PostgreSQL: adequado para escala, mas requer servidor separado e configuração de ambiente — complexidade desnecessária para MVP (Princípio V).
- MySQL: mesma razão de descarte do PostgreSQL.

---

## Decisão 4: Geração de PDF

**Decisão**: `pdfkit` (biblioteca Node.js).

**Justificativa**: Geração server-side de PDF simples (relatório tabular com histórico de viagens). `pdfkit` é pure-JS, sem dependências de runtime externas (sem Chrome headless). Para relatórios tabulares com dados textuais, é suficiente e leve.

**Alternativas consideradas**:
- Puppeteer (HTML → PDF): mais expressivo visualmente, mas adiciona ~200MB de dependência (Chromium). Descartado por Princípio V (Simplicidade).
- jsPDF (client-side): descartado pois o PDF precisaria ser gerado com dados do banco, que estão no servidor.

---

## Decisão 5: Autenticação

**Decisão**: `express-session` com senha hasheada via `bcryptjs`. Credencial única de administrador armazenada no banco de dados.

**Justificativa**: O MVP tem um único perfil de usuário (administrativo). Session-based auth é mais simples que JWT para aplicações web tradicionais sem requisitos de stateless. Bcrypt garante segurança mínima das credenciais.

**Alternativas consideradas**:
- JWT: adequado para APIs consumidas por mobile/terceiros. Desnecessário aqui pois há apenas um cliente (o próprio frontend) (Princípio V).
- OAuth2/SSO: fora do escopo do MVP.

---

## Decisão 6: Validação de CPF

**Decisão**: Implementar o algoritmo de validação de CPF brasileiro manualmente (dígitos verificadores) + regex para formato.

**Justificativa**: A lógica de validação é bem definida (algoritmo de módulo 11 dos dígitos verificadores). Implementação própria evita dependência de bibliotecas externas para uma função de ~20 linhas. Esta lógica é coberta por testes unitários (Princípio III).

---

## Decisão 7: Escala Rotativa de Motoristas

**Decisão**: A sugestão de escala é calculada dinamicamente: consulta a última viagem no banco por data desc e retorna o motorista oposto. Se não há viagem anterior, sugere o motorista de id menor.

**Justificativa**: Lógica simples e determinística. Não requer tabela de configuração adicional — deriva o estado da própria tabela de viagens, que é a fonte de verdade.

---

## Tabela Resumo

| Decisão | Escolha | Razão Principal |
|---------|---------|-----------------|
| Arquitetura | Backend REST + Frontend SPA | API-First (Princípio II) |
| Backend | Node.js + Express | Ecosistema do projeto |
| Frontend | React + Vite | Interatividade necessária, DX adequada |
| Banco | SQLite (better-sqlite3) | Zero-config, suficiente para MVP |
| PDF | pdfkit | Pure-JS, leve, sem runtime externo |
| Auth | express-session + bcrypt | Simples, único perfil de usuário |
| Validação CPF | Algoritmo próprio | Lógica conhecida, testável, sem deps extra |
| Escala motoristas | Query na tabela de viagens | Derivada da fonte de verdade existente |
