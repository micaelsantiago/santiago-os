## Why

A tela atual de Finanças mostra apenas um resumo mensal agregado e uma lista paginada de transações — o usuário não consegue visualizar o que aconteceu em cada dia específico do mês nem projetar sua capacidade de gasto diário. Esta iteração adiciona granularidade diária e previsibilidade de gastos, respondendo às perguntas "quanto gastei ontem?" e "quanto posso gastar por dia até o fim do mês?" sem adicionar gráficos ou complexidade visual.

## What Changes

- **Nova lista de dias**: substitui a lista de transações atual por uma visão diária com indicadores de atividade, barras proporcionais, totais de entrada/saída por dia e saldo acumulado
- **Cards de previsibilidade diária**: dois novos cards — "Disponível por dia" (margem diária calculada a partir do saldo atual e gastos fixos futuros) e "Gastos fixos restantes" (lista dos gastos recorrentes ainda não lançados no mês)
- **Modelo de transações recorrentes**: nova tabela `recurring_transactions` para armazenar transações que se repetem mensalmente (dia do mês, valor, categoria), usada como base para os cálculos de previsibilidade
- **Expansão de linha**: ao clicar em um dia com movimentação, a linha expande mostrando as transações individuais daquele dia
- **Indicadores de estado por dia**: ponto colorido (verde/vermelho/cinza/contorno) indicando se houve entrada, saída, nada ou dia futuro
- **Destaque do dia atual**: marcador visual "hoje" na lista de dias
- **Filtro de categoria**: o filtro existente passa a recalcular o saldo acumulado da lista de dias com base na categoria selecionada
- **Remoção do MonthlyOverview**: o bloco de barras de categoria é removido — a visibilidade por categoria fica visível nos indicadores diários

## Capabilities

### New Capabilities

- `daily-view`: Lista cronológica de todos os dias do mês com indicadores de atividade, totais diários e saldo acumulado. Inclui expansão de linha para ver transações do dia, destaque do dia atual e tratamento de dias futuros.
- `daily-predictability`: Cards de previsibilidade mostrando margem diária disponível e gastos fixos restantes no mês, calculados a partir do saldo atual e transações recorrentes futuras.
- `recurring-transactions`: Modelo de dados e CRUD para transações recorrentes (nome, valor, categoria, dia do mês), que servem de base para os cálculos de previsibilidade.

### Modified Capabilities

- `transaction-management`: O spec existente de gestão de transações é estendido para suportar a vinculação entre transações lançadas e transações recorrentes correspondentes, além da nova visualização diária que substitui a lista paginada anterior.

## Impact

- **Database**: Nova tabela `recurring_transactions` com RLS por `user_id`; possível nova coluna `recurring_transaction_id` (nullable FK) na tabela `transactions`
- **Frontend**: Refatoração significativa de `src/routes/financas/index.tsx` (substituição do TransactionList e MonthlyOverview pelos novos blocos); novos componentes para DailyView, DailyPredictability, DayRow; possível novo componente RecurringTransactionForm
- **Backend**: Lógica client-side para cálculo de saldo acumulado diário, margem diária e gastos fixos futuros
- **Bibliotecas**: Nenhuma nova dependência prevista
