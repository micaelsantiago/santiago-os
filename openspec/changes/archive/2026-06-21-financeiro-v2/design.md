## Context

Santiago OS é uma aplicação TanStack Start (React 19 + Nitro SSR) com Supabase (PostgreSQL + Auth). A v1 do módulo financeiro (`add-finance-feature`) implementou CRUD de transações e categorias com dashboard mensal. Esta v2 substitui a lista paginada de transações por uma visão diária com previsibilidade de gastos.

O acesso a dados segue o padrão estabelecido: Supabase client-side direto com RLS por `user_id`. A UI é em pt-BR com tema claro/escuro via Tailwind CSS v4.

## Goals / Non-Goals

**Goals:**
- Substituir `TransactionList` paginada por `DailyView` — lista cronológica de todos os dias do mês
- Adicionar `DailyPredictability` — cards de margem diária e gastos fixos restantes
- Criar tabela `recurring_transactions` para transações recorrentes
- Implementar expansão de linha para ver transações do dia
- Remover `MonthlyOverview` (barras de categoria) — substituído pelos indicadores diários
- Manter `BalanceSummary`, `FilterBar`, `TransactionForm` (modal) existentes com adaptações
- Suportar estados: mês vazio, mês futuro, mês passado, filtro de categoria ativo

**Non-Goals:**
- Gráficos, exportação, metas, comparativo entre meses, modo de orçamento
- UI de CRUD para transações recorrentes (será fase seguinte — os dados podem ser inseridos via Supabase dashboard ou seed)
- Paginação na lista de dias (todos os dias carregados de uma vez)
- Modo offline ou sincronização
- Migração de server-side rendering para dados financeiros

## Decisions

### 1. Fetch de todas as transações do mês (sem paginação)

**Decisão**: Remover paginação e buscar todas as transações do mês em uma única query. Remover `.range()` e `PAGE_SIZE`. O `hasMore` e `handleLoadMore` são removidos.

**Alternativa considerada**: Manter paginação e agrupar apenas o que foi carregado.

**Razão**: A lista de dias precisa de todas as transações para calcular saldo acumulado diário correto. O volume esperado (finanças pessoais, ~100-500 transações/mês) é baixo o suficiente para carregar tudo de uma vez. A paginação anterior existia para a lista de transações individuais, que agora é substituída pela expansão inline por dia.

### 2. Agregação diária client-side

**Decisão**: Buscar todas as transações do mês, agrupar por `date` no cliente usando `Map<string, DayData>`, e derivar saldo acumulado com `reduce` ordenado por data.

**Alternativa considerada**: SQL `GROUP BY date` com window function para running total no Supabase.

**Razão**: Consistência com o padrão existente de client-side aggregation. A simplicidade de manipular objetos tipados no TS supera a complexidade de montar a query SQL com window functions. Para o volume previsto, performance é irrelevante.

### 3. Modelo de transações recorrentes: tabela separada

**Decisão**: Criar tabela `recurring_transactions` com colunas: `id` (uuid PK), `user_id` (FK auth.users), `name` (text), `amount` (numeric 10,2), `category_id` (FK categories, nullable), `day_of_month` (integer 1-28), `active` (boolean, default true), `created_at` (timestamptz). Adicionar `recurring_transaction_id` (nullable FK) à tabela `transactions` para vinculação futura.

**Alternativa considerada**: Campo `is_recurring` + `recurrence_rule` na própria tabela `transactions`.

**Razão**: Tabela separada evita poluir `transactions` com colunas que só se aplicam a um subconjunto. Permite gerenciar recorrências independentemente (ativar/desativar, alterar dia) sem afetar transações já lançadas. A FK reversa em `transactions` permite rastrear quais lançamentos vieram de qual recorrência.

### 4. Saldo acumulado: histórico completo (não só mês atual)

**Decisão**: O saldo acumulado na coluna "Acumulado" da lista de dias considera o saldo do último dia do mês anterior como ponto de partida. Buscar transações desde o início (ou último dia com saldo zerado) até o fim do mês selecionado, não apenas o mês atual.

**Alternativa considerada**: Saldo acumulado apenas dentro do mês (reset no dia 1).

**Razão**: Um saldo acumulado que reseta no dia 1 não reflete a realidade financeira do usuário. Se o usuário tinha R$ 5000 acumulados até 31/maio, o dia 1/junho deve começar com R$ 5000 + transações do dia. Isso responde à pergunta aberta "O saldo acumulado na lista de dias deve considerar todos os meses anteriores?" com "sim".

**Implementação**: Adicionar uma query adicional que soma entradas − saídas de todas as transações com `date < startDate` (primeiro dia do mês selecionado). Esse valor é o `saldoInicial` do mês.

### 5. Cálculo da margem diária (Bloco 3)

**Decisão**: 
```
margem_diaria = (saldo_historico_total − soma_gastos_fixos_futuros) ÷ dias_restantes
```
Onde:
- `saldo_historico_total` = soma de todas as transações (entradas − saídas) desde sempre até hoje (não só o mês atual)
- `soma_gastos_fixos_futuros` = soma dos valores das `recurring_transactions` ativas cujo `day_of_month > hoje` (dentro do mês atual)
- `dias_restantes` = último dia do mês − hoje

**Alternativa considerada**: Usar apenas o saldo do mês atual.

**Razão**: O saldo histórico é o que o usuário realmente tem disponível. Usar apenas o mês atual daria uma falsa sensação de disponibilidade se o usuário tem saldo negativo histórico.

### 6. Remoção do MonthlyOverview

**Decisão**: O componente `MonthlyOverview` (barras de progresso por categoria) é removido da página de finanças. O arquivo é mantido no codebase mas não é mais renderizado em `/financas`.

**Razão**: A visibilidade por categoria agora é dada pelos indicadores diários + ícones de categoria nas transações expandidas. A especificação da v2 não inclui este bloco e prioriza simplicidade visual. O componente pode ser reaproveitado futuramente.

### 7. Estrutura de componentes da v2

**Decisão**: Novos componentes:
- `DailyPredictability.tsx` — renderiza os 2 cards de previsibilidade (Disponível por dia + Gastos fixos restantes)
- `DailyView.tsx` — renderiza a lista de 30/31 linhas de dias, gerencia expansão/recolhimento
- `DayRow.tsx` — renderiza uma linha de dia (expansível), com indicador, barra, valores

Componentes mantidos com adaptações:
- `BalanceSummary.tsx` — sem alterações estruturais
- `FilterBar.tsx` — sem alterações estruturais
- `TransactionForm.tsx` — sem alterações estruturais

Componentes removidos da página:
- `TransactionList.tsx` — substituído por `DailyView`
- `MonthlyOverview.tsx` — removido

### 8. Tratamento de estados por tipo de mês

**Decisão**: 
- **Mês atual** (contém hoje): Blocos 2, 3 e 4 todos visíveis. Dias futuros com opacidade 45%.
- **Mês passado** (anterior ao atual): Bloco 3 oculto (não faz sentido prever passado). Bloco 4 mostra todos os dias sem opacidade, sem dias futuros.
- **Mês futuro** (posterior ao atual): Bloco 3 oculto (sem transações para calcular). Bloco 4 mostra todos os dias como futuros (opacidade 45%, sem dados).
- **Mês vazio** (qualquer mês sem transações): Bloco 2 mostra R$ 0,00. Bloco 3 visível se for mês atual (margem calculada só com recorrentes). Bloco 4 mostra dias sem atividade.

**Razão**: Cada estado tem semântica diferente e esconder/se mostrar blocos inadequados evita confusão.

## Risks / Trade-offs

- **Performance com muitos anos de histórico**: Buscar todas as transações desde o início para calcular saldo acumulado pode degradar com 10k+ registros. → Mitigação: Na query do `saldoInicial`, usar `.select("type, amount")` sem join com categories e sem range — o payload é mínimo. Se necessário, adicionar um campo `cumulative_balance` materializado no futuro.
- **Transações recorrentes sem UI**: O usuário não tem como cadastrar recorrências pela interface. → Mitigação: Incluir seed de recorrências ou instruções para inserção via Supabase dashboard. A UI de CRUD de recorrências é a primeira tarefa da fase seguinte.
- **Remoção do MonthlyOverview**: Usuários acostumados com as barras de categoria podem sentir falta. → Mitigação: A informação de categoria permanece visível nos ícones das transações expandidas. Feedback do usuário determinará se o componente deve retornar.
- **Saldo acumulado cross-month**: Se o usuário mudar de mês, o saldo inicial é recalculado, o que pode causar uma jump visual no primeiro dia. → Mitigação: O cálculo é determinístico e instantâneo; o "jump" é esperado (mês diferente = ponto de partida diferente).

## Open Questions

- Confirmar se o saldo acumulado cross-month é a interpretação correta (a especificação original deixou em aberto)
- Definir se a tabela `recurring_transactions` terá seed inicial com alguns exemplos ou começará vazia
- A barra de atividade é proporcional ao valor absoluto do dia ou relativa ao maior dia do mês? (Especificação original deixou em aberto — assumir relativa ao maior dia para melhor distinção visual)
