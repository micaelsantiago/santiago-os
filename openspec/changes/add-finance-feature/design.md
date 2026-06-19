## Context

Santiago OS é uma aplicação TanStack Start (React SSR) com Supabase (PostgreSQL + Auth). O projeto está em estágio inicial: tem autenticação funcionando, layout com sidebar, e um dashboard placeholder. Não existe ORM — o acesso a dados é feito diretamente via `@supabase/supabase-js` no cliente. A UI é toda em português (pt-BR) com suporte a tema claro/escuro.

Este design cobre a primeira funcionalidade de negócio do sistema: controle financeiro pessoal.

## Goals / Non-Goals

**Goals:**
- Modelar e criar as tabelas `categories` e `transactions` no Supabase com RLS
- Implementar CRUD completo de transações e categorias
- Construir dashboard financeiro com saldo, totais e resumo mensal
- Adicionar filtros por período (mês/ano) e categoria
- Integrar a navegação na sidebar existente

**Non-Goals:**
- Transações recorrentes
- Múltiplas moedas
- Metas financeiras
- Relatórios avançados (exportação, gráficos complexos)
- Server-side rendering para dados financeiros (primeira versão client-side)
- Sincronização com bancos ou APIs externas

## Decisions

### 1. Acesso a dados: Supabase client direto (sem API layer)

**Decisão**: Usar `supabase.from("table").select()` diretamente nos componentes React, sem criar um intermediário (server functions, API routes, ou tRPC).

**Alternativa considerada**: Criar API functions no servidor TanStack Start e chamá-las do cliente.

**Razão**: O projeto já usa Supabase client-side para auth. Para dados protegidos por RLS com `user_id`, o cliente Supabase é suficiente. Adicionar uma camada intermediária aumentaria complexidade sem benefício claro neste estágio. A RLS garante que cada usuário só vê seus próprios dados.

### 2. Schema do banco: duas tabelas simples

**Decisão**: Modelo com duas tabelas relacionadas:
- `categories`: `id` (uuid), `user_id`, `name`, `icon` (emoji), `color`, `created_at`
- `transactions`: `id` (uuid), `user_id`, `type` (income/expense), `amount` (numeric 10,2), `category_id` (FK para categories), `description` (opcional), `date`, `created_at`

**Alternativa considerada**: Tabela única de movimentações com campo booleano de entrada/saída, sem tabela de categorias separada.

**Razão**: Categorias separadas permitem reutilização, padronização, edição centralizada e filtros mais eficientes. O overhead de uma FK é mínimo para o volume esperado (finanças pessoais).

### 3. Migração inicial com categorias padrão

**Decisão**: A migração SQL criará as tabelas e inserirá ~10 categorias padrão (Salário, Freela, Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Assinaturas, Outros) para todo novo usuário.

**Alternativa considerada**: Criar categorias via seed no primeiro acesso.

**Razão**: Categorias padrão eliminam atrito no onboarding. Como são inseridas via trigger `on_auth_user_created` associado ao `user_id`, cada usuário recebe sua própria cópia. Isso evita complexidade de "categorias globais" e mantém os dados isolados por RLS.

### 4. Cálculos de saldo: client-side aggregations

**Decisão**: Calcular saldo e totais no cliente usando `.select()` com agregações no Supabase (`.select("type, amount")` + reduce no JS) ou usando `.select("type, amount.sum()")` com group.

**Alternativa considerada**: View materializada no PostgreSQL, ou função `SECURITY INVOKER` para cálculo no servidor.

**Razão**: Para o volume de transações de um usuário pessoa física (centenas a poucos milhares), o cálculo client-side é instantâneo e mais simples. Se performance se tornar problema, migrar para agregação SQL é trivial.

### 5. Estrutura de rotas: sub-rotas planas

**Decisão**: Rotas no padrão TanStack Router file-based:
- `src/routes/financas/index.tsx` → `/financas` (dashboard + listagem)
- `src/routes/financas/nova.tsx` → `/financas/nova` (formulário)
- `src/routes/financas/categorias.tsx` → `/financas/categorias` (gestão de categorias)

**Alternativa considerada**: Single-page com modais/tabs em vez de rotas separadas.

**Razão**: Rotas separadas seguem o padrão TanStack Router, permitem navegação direta por URL e são mais fáceis de evoluir incrementalmente. O formulário de nova transação como rota própria (não modal) é mais adequado para mobile.

### 6. Componentização

**Decisão**: Componentes específicos no diretório `src/components/`:
- `TransactionForm.tsx` — formulário reutilizável (usado em criação)
- `TransactionList.tsx` — tabela/listagem com ações
- `CategoryManager.tsx` — CRUD de categorias
- `BalanceSummary.tsx` — cards de saldo/totais
- `MonthlyOverview.tsx` — resumo mensal com barras
- `FilterBar.tsx` — filtros de período e categoria

### 7. Formulários: React state controlado sem lib externa

**Decisão**: Formulários com `useState` e validação inline, sem React Hook Form ou Zod.

**Razão**: Os formulários são simples (4-5 campos). Adicionar dependências de validação neste estágio seria overengineering. Pode ser revisitado quando houver formulários mais complexos.

### 8. Resumo mensal: agrupamento client-side

**Decisão**: Buscar transações do mês atual, agrupar por categoria no cliente com `reduce`, calcular percentuais e renderizar barras de progresso com Tailwind.

**Alternativa considerada**: Server function com SQL `GROUP BY`.

**Razão**: Mesma lógica do item 4 — volume baixo, simplicidade > performance prematura.

## Risks / Trade-offs

- **Performance com muitas transações**: Se um usuário acumular 10k+ transações, buscar todas de uma vez degrada. → Mitigação: usar paginação (`.range()`) na listagem e filtro de período para reduzir o volume.
- **RLS policy esquecida**: Sem RLS, dados de um usuário podem vazar para outro via API Supabase. → Mitigação: políticas RLS são criadas junto com as tabelas na migração e verificadas com `get_advisors`.
- **Cálculo client-side impreciso**: Se houver concorrência ou dados parciais, o saldo exibido pode divergir do real. → Mitigação: buscar sempre o snapshot completo no momento da consulta; o saldo é derivado, não armazenado.
- **Formulário sem validação robusta**: Pode aceitar valores negativos ou categorias inexistentes. → Mitigação: validação básica inline (valor > 0, categoria requerida) + constraint `CHECK (amount > 0)` no banco.

## Open Questions

- Qual período padrão exibir no dashboard? (Resposta esperada: mês atual)
- As categorias padrão devem ser editáveis pelo usuário ou fixas? (Resposta esperada: editáveis — usuário pode criar, editar e excluir)
- Excluir uma categoria com transações associadas deve ser permitido? Se sim, o que acontece com as transações? (Resposta esperada: ON DELETE SET NULL — transações ficam sem categoria)
