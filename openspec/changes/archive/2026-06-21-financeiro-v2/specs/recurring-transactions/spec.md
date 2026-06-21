## ADDED Requirements

### Requirement: Sistema armazena transações recorrentes
O sistema SHALL manter uma tabela `recurring_transactions` com os campos: `id` (uuid PK), `user_id` (FK auth.users), `name` (text, NOT NULL), `amount` (numeric 10,2, NOT NULL, > 0), `category_id` (FK categories, nullable), `day_of_month` (integer, 1-28, NOT NULL), `active` (boolean, default true), `created_at` (timestamptz, default now()).

#### Scenario: Criar transação recorrente
- **WHEN** uma transação recorrente é inserida com nome "Aluguel", valor 1200.00, categoria "Moradia", dia 10
- **THEN** o registro é persistido com `active = true` e fica disponível para consulta

#### Scenario: Validar dia do mês
- **WHEN** tenta-se inserir uma transação recorrente com `day_of_month = 31`
- **THEN** o banco rejeita com violação de constraint CHECK (day_of_month BETWEEN 1 AND 28)

#### Scenario: Validar valor positivo
- **WHEN** tenta-se inserir uma transação recorrente com `amount <= 0`
- **THEN** o banco rejeita com violação de constraint CHECK (amount > 0)

### Requirement: Transações recorrentes são isoladas por usuário
O sistema SHALL aplicar Row Level Security na tabela `recurring_transactions` para que cada usuário veja apenas suas próprias recorrências.

#### Scenario: Usuário consulta suas recorrências
- **WHEN** usuário autenticado consulta `recurring_transactions`
- **THEN** o Supabase retorna apenas registros onde `user_id = auth.uid()`

### Requirement: Transação lançada pode ser vinculada a uma recorrência
O sistema SHALL permitir que a tabela `transactions` referencie uma transação recorrente via coluna `recurring_transaction_id` (uuid, nullable, FK `recurring_transactions.id` ON DELETE SET NULL).

#### Scenario: Lançar transação vinculada a recorrência
- **WHEN** uma transação é inserida com `recurring_transaction_id` apontando para uma recorrência existente
- **THEN** a transação fica vinculada e a recorrência pode ser identificada

#### Scenario: Recorrência excluída não afeta transações lançadas
- **WHEN** uma transação recorrente é excluída e há transações lançadas vinculadas a ela
- **THEN** as transações permanecem mas com `recurring_transaction_id = NULL`

### Requirement: Consulta de gastos fixos futuros é eficiente
O sistema SHALL prover uma query que retorna transações recorrentes ativas cujo `day_of_month` é maior que o dia atual, ordenadas por `day_of_month`, para uso no cálculo de previsibilidade.

#### Scenario: Filtrar recorrências futuras do mês
- **WHEN** hoje é dia 15 e existem recorrências nos dias 5, 10, 20 e 25
- **THEN** a query retorna apenas as recorrências dos dias 20 e 25, ordenadas por dia

#### Scenario: Recorrência inativa é ignorada
- **WHEN** uma transação recorrente está com `active = false`
- **THEN** ela não aparece na consulta de gastos fixos futuros
