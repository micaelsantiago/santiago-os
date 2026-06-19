## Why

Usuários do Santiago OS precisam de visibilidade sobre suas finanças pessoais — saber quanto dinheiro entra e sai todo mês, de forma simples e categorizada. Hoje o sistema não tem nenhuma funcionalidade financeira, e o controle manual em planilhas é frágil e desconectado do restante da aplicação.

## What Changes

- Nova tabela `categories` para gerenciar categorias de transação (ex: Salário, Alimentação, Transporte)
- Nova tabela `transactions` para registrar entradas e saídas com valor, categoria, data e descrição
- Nova rota `/financas` com dashboard financeiro: saldo atual, totais de entrada/saída, resumo mensal
- Nova rota `/financas/nova` com formulário de cadastro de transação
- Nova rota `/financas/categorias` para gerenciar categorias
- Novo item "Financeiro" na sidebar substituindo um placeholder existente
- Filtros por período (mês/ano) e categoria na listagem de transações
- Resumo mensal visual com totais agrupados por categoria

## Capabilities

### New Capabilities

- `transaction-management`: CRUD completo de transações financeiras (entradas e saídas), com listagem paginada, filtros por período e categoria, e exclusão. Cada transação tem valor, tipo (entrada/saída), categoria, data e descrição opcional.
- `category-management`: Listagem, criação, edição e exclusão de categorias para classificar transações. Categorias padrão são criadas na migração inicial. Cada categoria tem nome, ícone (emoji) e cor.
- `finance-dashboard`: Painel financeiro com saldo atual calculado (entradas - saídas), total de entradas, total de saídas, resumo mensal agrupado por categoria com barras de progresso visuais, e indicadores de período ativo.

### Modified Capabilities

<!-- Nenhum — não existem specs anteriores para modificar -->

## Impact

- **Banco de dados**: Novas tabelas `categories` e `transactions` no schema `public` do Supabase com RLS habilitada e políticas por `user_id`
- **Rotas**: 3 novas rotas (`/financas`, `/financas/nova`, `/financas/categorias`)
- **Componentes**: Novo componente `TransactionForm`, `CategoryManager`, `MonthlySummary`, `BalanceCard`
- **Sidebar**: Substituição de um placeholder por link ativo para `/financas`
- **Dependências**: Nenhuma nova dependência externa — usa apenas `@supabase/supabase-js` já presente
