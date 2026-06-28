# Quickstart: Gerenciamento de Transporte de Pacientes SESAM

**Feature**: 001-patient-transport-mgmt
**Date**: 2026-06-27

Este guia valida que o sistema funciona de ponta a ponta. Execute os cenários na ordem.

---

## Pré-requisitos

- Node.js 20+ instalado
- Dependências do projeto instaladas (`npm install` na raiz e em `backend/` e `frontend/`)
- Banco de dados inicializado (`npm run db:setup` em `backend/`)
- Servidores rodando:
  - Backend: `npm start` em `backend/` (porta 3001)
  - Frontend: `npm run dev` em `frontend/` (porta 5173)

---

## Cenário 1: Login e Acesso

1. Abra `http://localhost:5173` no navegador
2. Faça login com usuário `admin` e a senha configurada no setup
3. **Esperado**: Redirecionado para a tela inicial do sistema (lista de viagens)
4. Tente acessar qualquer rota sem login (abra aba anônima)
5. **Esperado**: Redirecionado para a tela de login

---

## Cenário 2: Cadastrar Paciente

1. Acesse **Pacientes → Novo Paciente**
2. Preencha:
   - Nome: `Maria da Silva`
   - CPF: `529.982.247-25` (CPF válido para teste)
   - Telefone: `(86) 99999-0001`
   - Ponto de embarque: `SESAM`
   - Prioridade: `Normal`
3. Clique em **Salvar**
4. **Esperado**: Paciente aparece na listagem com os dados informados
5. Tente cadastrar o mesmo CPF novamente
6. **Esperado**: Mensagem "CPF já cadastrado no sistema"
7. Tente salvar com CPF inválido (ex.: `111.111.111-11`)
8. **Esperado**: Mensagem de CPF inválido

---

## Cenário 3: Cadastrar Acompanhante

1. Na listagem de pacientes, acesse **Maria da Silva → Editar**
2. Adicione acompanhante: Nome `João da Silva`, Ocupa vaga: Sim
3. **Esperado**: Acompanhante salvo e exibido no perfil do paciente

---

## Cenário 4: Criar Viagem

1. Acesse **Viagens → Nova Viagem**
2. Preencha:
   - Data: amanhã (ex.: `2026-06-28`)
   - Motorista: verifique se o sistema sugere o correto pela escala
   - Placa: `ABC-1234`
   - Modelo: `Sprinter 415`
3. Clique em **Criar**
4. **Esperado**: Viagem criada com 0/28 vagas ocupadas
5. Tente criar outra viagem para a mesma data
6. **Esperado**: Mensagem "Já existe uma viagem cadastrada para essa data"

---

## Cenário 5: Agendar Paciente na Viagem

1. Abra a viagem criada no Cenário 4
2. Clique em **Agendar Paciente**
3. Selecione **Maria da Silva**
4. Preencha:
   - Motivo: `Consulta oncológica mensal`
   - Ponto de desembarque em Teresina: `H.U.`
   - Destino real: `HUPI - Oncologia`
5. Confirme o agendamento
6. **Esperado**: Agendamento criado; vagas da viagem mostram `2/28` (paciente + acompanhante)

---

## Cenário 6: Validação de Capacidade

1. Crie 27 pacientes adicionais (pode ser via API diretamente para economizar tempo) e agende todos na mesma viagem (sem acompanhantes)
2. A viagem deve mostrar `28/28`
3. Tente agendar mais um paciente
4. **Esperado**: Mensagem "Viagem sem vagas disponíveis (28/28)"

> Atalho via API (ajuste para sua pasta de scripts):
> ```bash
> curl -s -X POST http://localhost:3001/api/pacientes \
>   -H "Content-Type: application/json" \
>   -b cookies.txt \
>   -d '{"nome":"Teste X","cpf":"...", "telefone":"(86)99999-0002","ponto_embarque":"SESAM","prioridade":"Normal"}'
> ```

---

## Cenário 7: Cancelar Agendamento

1. Na viagem do Cenário 5, cancele o agendamento de Maria da Silva
2. **Esperado**: Vagas voltam a `0/28`
3. Re-agende Maria da Silva
4. Tente cancelar um agendamento de uma viagem passada (altere a data do banco para ontem em dev)
5. **Esperado**: Mensagem "Não é possível cancelar agendamentos de viagens já realizadas"

---

## Cenário 8: Registrar Presença e Retorno

1. Com Maria da Silva agendada, acesse a viagem e o painel de presença
2. Marque **Presente**
3. **Esperado**: Status muda para `Presente`
4. Registre retorno: **Voltou no Dia**
5. **Esperado**: Status de retorno atualizado
6. Tente registrar retorno de um paciente com status `Faltou`
7. **Esperado**: Mensagem "Retorno só pode ser registrado para pacientes marcados como Presentes"

---

## Cenário 9: Escala Rotativa de Motoristas

1. A viagem do Cenário 4 usa o Motorista 1
2. Crie uma segunda viagem para outra data
3. **Esperado**: Sistema sugere Motorista 2
4. Crie uma terceira viagem
5. **Esperado**: Sistema sugere Motorista 1 (alternância confirmada)

---

## Cenário 10: Relatório PDF

1. Com Maria da Silva tendo pelo menos um agendamento com histórico, acesse **Pacientes → Maria da Silva → Gerar Relatório PDF**
2. **Esperado**: Download de arquivo PDF iniciado em menos de 10 segundos
3. Abra o PDF
4. **Esperado**: PDF contém nome do paciente, lista de viagens com data, motivo, ponto de embarque, ponto de desembarque, destino real e status de retorno, ordenado por data

---

## Cenário 11: Listagem de Viagens por Data

1. Acesse **Viagens** e filtre pela data da viagem criada no Cenário 4
2. **Esperado**: Apenas a viagem dessa data aparece, com Maria da Silva listada com ponto de embarque, prioridade e status de presença/retorno

---

## Verificação de Integridade de Dados

Após os cenários acima, verifique no banco de dados (via CLI SQLite ou ferramenta GUI):

```sql
-- Vagas ocupadas deve refletir os agendamentos ativos
SELECT v.data, v.vagas_ocupadas,
       COUNT(a.id) as agendamentos_count
FROM viagens v
LEFT JOIN agendamentos a ON a.viagem_id = v.id
GROUP BY v.id;

-- CPF único
SELECT cpf, COUNT(*) FROM pacientes GROUP BY cpf HAVING COUNT(*) > 1;
-- Deve retornar vazio
```
