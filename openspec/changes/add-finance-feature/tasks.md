## 1. Database Schema

- [x] 1.1 Run SQL migration to create `categories` table with columns: id (uuid), user_id (uuid FK → auth.users), name (text), icon (text), color (text), created_at (timestamptz)
- [x] 1.2 Run SQL migration to create `transactions` table with columns: id (uuid), user_id (uuid FK → auth.users), type (text CHECK income/expense), amount (numeric 10,2 CHECK > 0), category_id (uuid FK → categories ON DELETE SET NULL), description (text nullable), date (date), created_at (timestamptz)
- [x] 1.3 Create database trigger to insert default categories (Salário, Freela, Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Assinaturas, Outros) for each new user on `auth.users` insert
- [x] 1.4 Enable RLS on `categories` and `transactions` tables
- [x] 1.5 Create RLS policies: SELECT/INSERT/UPDATE/DELETE for authenticated users where `user_id = auth.uid()` on both tables
- [x] 1.6 Grant SELECT, INSERT, UPDATE, DELETE on `categories` and `transactions` to `authenticated` role
- [x] 1.7 Run `get_advisors` security check and fix any issues

## 2. Category Management

- [x] 2.1 Create route `/financas/categorias` at `src/routes/financas/categorias.tsx`
- [x] 2.2 Build `CategoryManager` component: table/list of user's categories with emoji, name, color preview, edit and delete actions
- [x] 2.3 Implement "Nova categoria" form (inline or dialog): name input, emoji picker, color selector
- [x] 2.4 Implement edit category (inline or dialog): pre-fill name, emoji, color from existing category
- [x] 2.5 Implement delete category with confirmation dialog and warning about affected transactions
- [x] 2.6 Handle edge cases: duplicate name error, delete last category, empty state

## 3. Transaction CRUD

- [x] 3.1 Create route `/financas/nova` at `src/routes/financas/nova.tsx`
- [x] 3.2 Build `TransactionForm` component with fields: type toggle (entrada/saída), amount input (R$), category select (loaded from DB with emoji), date picker, description textarea
- [x] 3.3 Implement form validation: amount > 0 required, category required, date required
- [x] 3.4 Implement save transaction to Supabase with success toast and redirect to `/financas`
- [x] 3.5 Build `TransactionList` component: table with date, type badge (entrada/saída com cor), category with emoji, description, amount (formatado), delete button
- [x] 3.6 Implement date formatting in pt-BR (ex: "15 de junho, 2026")
- [x] 3.7 Implement currency formatting as BRL (ex: "R$ 1.500,00")
- [x] 3.8 Implement delete transaction with confirmation dialog
- [x] 3.9 Implement empty state when no transactions exist
- [x] 3.10 Implement pagination: 20 items per page, "Carregar mais" button

## 4. Dashboard & Summary

- [x] 4.1 Create route `/financas` at `src/routes/financas/index.tsx` as the main finance page (dashboard + transaction list)
- [x] 4.2 Build `BalanceSummary` component: 3 cards (Saldo, Entradas, Saídas) with formatted BRL values, color coding (green/red/neutral)
- [x] 4.3 Calculate saldo = sum(income) - sum(expense) from current period transactions
- [x] 4.4 Build `MonthlyOverview` component: group expenses by category, calculate percentage, render progress bars with category color
- [x] 4.5 Show monthly overview only for expenses (saídas), not income
- [x] 4.6 Add "Nova transação" primary button linking to `/financas/nova`
- [x] 4.7 Implement responsive layout: cards side-by-side on desktop (≥lg), stacked on mobile

## 5. Filters

- [x] 5.1 Build `FilterBar` component with month/year selector and category multi-select
- [x] 5.2 Implement month/year selector: dropdown with months in pt-BR, defaults to current month
- [x] 5.3 Implement category filter: dropdown multi-select with category emoji + name, "Todas" as default
- [x] 5.4 Filter transactions query by date range (first and last day of selected month) and selected categories
- [x] 5.5 Recalculate BalanceSummary and MonthlyOverview when filters change
- [x] 5.6 Preserve filter state in URL search params (e.g., `/financas?mes=6&ano=2026&categoria=uuid`)

## 6. Navigation & Integration

- [x] 6.1 Add "Financeiro" nav item to Sidebar `primaryNav` array with appropriate icon (e.g., `Wallet` from lucide-react) linking to `/financas`
- [x] 6.2 Ensure all finance routes are protected by auth (redirect to `/login` if unauthenticated)
- [x] 6.3 Add page title "Finanças" header on the finance dashboard page

## 7. Polish & Verify

- [x] 7.1 Test full flow: register user → default categories created → create transaction → view dashboard → filter → delete transaction → verify balance
- [x] 7.2 Test RLS isolation: create two users, verify neither sees the other's data
- [x] 7.3 Test edge cases: delete category with transactions, zero transactions, very large amounts, rapid successive operations
- [x] 7.4 Verify responsive layout on mobile viewport (375px width)
- [x] 7.5 Verify light/dark theme compatibility on all finance pages
- [x] 7.6 Run `npm run lint` and verify TypeScript/Build compilation
