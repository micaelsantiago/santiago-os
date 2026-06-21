## 1. Database Migration

- [x] 1.1 Criar tabela `recurring_transactions` com colunas: `id` (uuid PK), `user_id` (FK auth.users), `name` (text), `amount` (numeric 10,2), `category_id` (FK categories nullable), `day_of_month` (integer 1-28), `active` (boolean default true), `created_at` (timestamptz)
- [x] 1.2 Adicionar constraint CHECK (`amount > 0` e `day_of_month BETWEEN 1 AND 28`) na tabela `recurring_transactions`
- [x] 1.3 Adicionar coluna `recurring_transaction_id` (uuid nullable, FK `recurring_transactions.id` ON DELETE SET NULL) na tabela `transactions`
- [x] 1.4 Criar políticas RLS na tabela `recurring_transactions` (`user_id = auth.uid()` para SELECT/INSERT/UPDATE/DELETE)
- [x] 1.5 Criar trigger `on_auth_user_created` para inserir recorrências padrão (ex: Moradia dia 5, Assinatura dia 25) para novos usuários

## 2. Types e Utilitários

- [x] 2.1 Adicionar interface `RecurringTransaction` nos tipos compartilhados
- [x] 2.2 Adicionar interface `DayData` (agrupamento de transações por dia com totais, indicador e saldo acumulado)
- [x] 2.3 Criar utilitário `getDaysInMonth(month, year)` que retorna array com todos os dias do mês
- [x] 2.4 Criar utilitário `getMonthState(month, year)` que classifica o mês como "past", "current" ou "future"
- [x] 2.5 Atualizar `getMonthDateRange` ou criar helper para buscar saldo inicial (soma de transações antes do mês)

## 3. Componente DailyPredictability

- [x] 3.1 Criar `DailyPredictability.tsx` com props: `saldoHistorico`, `gastosFixoFuturos` (array de recorrências), `diasRestantes`
- [x] 3.2 Implementar cálculo da margem diária: `(saldoHistorico - somaGastosFixos) / diasRestantes`
- [x] 3.3 Renderizar Card A "Disponível por dia" com valor formatado, indicador de dias restantes e alerta visual se negativo
- [x] 3.4 Renderizar Card B "Gastos fixos restantes" com total e lista de itens (nome + dia), truncando em 3 itens com "+ N outros"
- [x] 3.5 Aplicar layout responsivo (lado a lado em >= 768px, empilhado em < 768px)

## 4. Componente DayRow (linha expansível de dia)

- [x] 4.1 Criar `DayRow.tsx` com props: `day`, `dayData` (DayData | null), `isToday`, `isFuture`, `maxDayAmount` (para barra proporcional)
- [x] 4.2 Renderizar data formatada (dia da semana abreviado + número, ex: "Seg 2")
- [x] 4.3 Renderizar barra de atividade proporcional a `abs(totalEntradas + totalSaidas) / maxDayAmount`
- [x] 4.4 Renderizar colunas Entrada (verde ou "—") e Saída (vermelho ou "—") com valores formatados
- [x] 4.5 Renderizar coluna Acumulado (saldo acumulado até o dia)
- [x] 4.6 Renderizar indicador visual com 4 estados: verde (entrada), vermelho (saída sem entrada), cinza (sem movimento), contorno (futuro)
- [x] 4.7 Aplicar badge "hoje" + fundo destacado quando `isToday` for true
- [x] 4.8 Aplicar opacidade 45% quando `isFuture` for true, com acumulado congelado e barra vazia
- [x] 4.9 Implementar expansão ao clique: exibir transações do dia com emoji, descrição, categoria, valor
- [x] 4.10 Garantir que apenas uma linha fique expandida por vez (controlado no pai)

## 5. Componente DailyView

- [x] 5.1 Criar `DailyView.tsx` com props: `transactions`, `saldoInicial`, `month`, `year`, `categoryFilter`
- [x] 5.2 Agrupar transações por dia em `Map<string, DayData>` com totais de entrada/saída e lista de transações do dia
- [x] 5.3 Gerar array com todos os dias do mês (1 a 28/29/30/31) e mesclar com DayData
- [x] 5.4 Calcular saldo acumulado diário: `saldoInicial + runningSum` iterando dias em ordem
- [x] 5.5 Calcular `maxDayAmount` (maior valor absoluto diário) para barras proporcionais
- [x] 5.6 Identificar dia atual (`isToday`) e dias futuros (`isFuture`)
- [x] 5.7 Renderizar cabeçalho da tabela com nomes das colunas
- [x] 5.8 Renderizar uma `DayRow` para cada dia do mês
- [x] 5.9 Gerenciar estado de qual linha está expandida (apenas uma por vez)
- [x] 5.10 Aplicar scroll natural da página (todos os dias renderizados de uma vez)

## 6. Refatoração da Página Principal

- [x] 6.1 Em `src/routes/financas/index.tsx`, substituir `TransactionList` e `MonthlyOverview` por `DailyView` e `DailyPredictability`
- [x] 6.2 Remover lógica de paginação (`PAGE_SIZE`, `hasMore`, `page`, `handleLoadMore`, `pageRef`)
- [x] 6.3 Alterar `loadTransactions` para buscar todas as transações do mês sem `.range()` (remover paginação)
- [x] 6.4 Adicionar query para buscar `saldoInicial` (soma de transações anteriores ao mês selecionado)
- [x] 6.5 Adicionar query para buscar `recurring_transactions` ativas com `day_of_month > hoje` (para previsibilidade)
- [x] 6.6 Implementar lógica para ocultar `DailyPredictability` em meses passados e futuros
- [x] 6.7 Passar `saldoInicial` e `gastosFixoFuturos` para os componentes apropriados
- [x] 6.8 Garantir que filtro de categoria recalcula tudo corretamente (saldo, totais, days)

## 7. Atualização do FilterBar

- [x] 7.1 Substituir os dois dropdowns separados (mês e ano) por um dropdown combinado "Mês/Ano" (ex: "Junho 2026")
- [x] 7.2 Ajustar `handleFilterChange` e `parseSearchParams` para o novo formato unificado

## 8. Limpeza e Verificação

- [x] 8.1 Verificar que `TransactionList.tsx` não é mais importado em `/financas` (arquivo preservado para possível reuso)
- [x] 8.2 Verificar que `MonthlyOverview.tsx` não é mais importado em `/financas` (arquivo preservado para possível reuso)
- [x] 8.3 Testar estados: mês atual com transações, mês vazio, mês passado, mês futuro
- [x] 8.4 Testar filtro de categoria com e sem transações no período
- [x] 8.5 Testar expansão/recolhimento de linhas de dia
- [x] 8.6 Testar cálculo de margem diária nos cards de previsibilidade
- [x] 8.7 Verificar layout responsivo (desktop e mobile) para todos os blocos
- [x] 8.8 Executar lint (`npx biome check src/`) e corrigir eventuais problemas
- [x] 8.9 Executar typecheck (`npx tsc --noEmit`) e corrigir erros de tipo
