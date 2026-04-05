# Contributing

Guia para contribuir com o Santiago OS — convenções, workflow e como criar novos módulos.

---

## Setup de Desenvolvimento

Veja o [Getting Started](./getting-started.md) para configuração inicial.

---

## Workflow de Branches

```
main ─── produção (deploy direto)
  └── feat/nome ─── nova feature
  └── fix/nome  ─── correção de bug
```

- `main` é a branch de produção
- Features e fixes em branches separadas
- PRs para `main` com review

---

## Commits

Formato: `tipo(escopo): descrição em português`

```
feat(tasks): adicionar filtro por prioridade
fix(notes): corrigir debounce no editor
chore(lint): atualizar config do ESLint
test(tasks): adicionar testes para moveTask
refactor(auth): extrair helper de rate limit
docs: atualizar README com seção de RBAC
perf(notes): otimizar query de busca full-text
```

Tipos: `feat` `fix` `chore` `docs` `refactor` `test` `perf`

---

## Convenções de Código

### Nomenclatura

| O quê | Padrão | Exemplo |
|-------|--------|---------|
| Componentes | PascalCase | `TaskCard.tsx` |
| Hooks | camelCase | `useTaskBoard.ts` |
| Utilitários / stores | kebab-case | `task-store.ts` |
| Tipos | kebab-case | `task.types.ts` |
| Constantes | SCREAMING_SNAKE | `MAX_COLUMNS` |
| Interfaces TS | PascalCase | `TaskCard`, `BoardColumn` |
| Rotas | kebab-case | `/tasks/[task-id]` |

### TypeScript

- `strict: true` sem exceções
- Sem `any` sem justificativa
- `@ts-ignore` proibido — usar `@ts-expect-error` com comentário
- `interface` para objetos, `type` para uniões e utilitários

### React

- **Server Component por padrão** — `"use client"` só com interatividade
- **Named export** sempre — nunca `default export`
- **Props com interface** — nunca `type`
- **Imports via alias** — `@/modules/...`, nunca `../../..`

### Server Actions

- Toda mutação via Server Action (`'use server'`)
- Nunca Supabase direto no cliente para escrita
- Retorno `{ error }` ou `{ success, data }` — nunca throw
- `effectiveUserId` em vez de `user.id`
- Validação Zod antes de qualquer query

---

## Como Criar um Novo Módulo

### 1. Estrutura de diretórios

```bash
mkdir -p src/modules/meu-modulo/{actions,components,queries,store,types}
```

### 2. Definir schemas (types/)

```typescript
// src/modules/meu-modulo/types/meu-modulo.types.ts
import { z } from 'zod'

export const meuItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  created_at: z.string().datetime(),
})

export const createMeuItemSchema = z.object({
  title: z.string().min(1).max(255),
})

export type MeuItem = z.infer<typeof meuItemSchema>
export type CreateMeuItemInput = z.infer<typeof createMeuItemSchema>
```

### 3. Criar migration (supabase/migrations/)

```sql
-- supabase/migrations/YYYYMMDD_create_meu_modulo.sql

CREATE TABLE IF NOT EXISTS meu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meu_items ENABLE ROW LEVEL SECURITY;

-- Usar o padrão RBAC existente
CREATE POLICY "select own or master" ON meu_items FOR SELECT
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "insert own or as member" ON meu_items FOR INSERT
  WITH CHECK (is_owner_or_authorized_member(user_id));
CREATE POLICY "update own or as member" ON meu_items FOR UPDATE
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "delete own only" ON meu_items FOR DELETE
  USING (auth.uid() = user_id);
```

Aplicar e regenerar tipos:

```bash
supabase db push
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

### 4. Implementar Server Actions (actions/)

```typescript
// src/modules/meu-modulo/actions/meu-modulo.actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthenticatedUserWithRole } from '@/lib/supabase/get-user'
import { createMeuItemSchema } from '../types/meu-modulo.types'
import type { CreateMeuItemInput, MeuItem } from '../types/meu-modulo.types'

const uuidParam = z.string().uuid()

export async function createMeuItem(input: CreateMeuItemInput) {
  const { supabase, effectiveUserId } = await getAuthenticatedUserWithRole()
  const parsed = createMeuItemSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from('meu_items')
    .insert({ ...parsed.data, user_id: effectiveUserId })
    .select()
    .single()

  if (error) return { error: 'Erro ao criar item' }
  revalidatePath('/meu-modulo')
  return { success: true, data: data as MeuItem }
}

export async function deleteMeuItem(id: string) {
  if (!uuidParam.safeParse(id).success) return { error: 'ID inválido' }
  const { supabase, effectiveUserId, isMaster } = await getAuthenticatedUserWithRole()

  if (!isMaster) return { error: 'Membros não podem deletar recursos' }

  const { error } = await supabase
    .from('meu_items')
    .delete()
    .eq('id', id)
    .eq('user_id', effectiveUserId)

  if (error) return { error: 'Erro ao deletar item' }
  revalidatePath('/meu-modulo')
  return { success: true }
}
```

### 5. Criar página (app/)

```typescript
// src/app/(app)/meu-modulo/page.tsx
import { checkModuleAccess } from '@/lib/supabase/get-user'

export default async function MeuModuloPage() {
  await checkModuleAccess('meu-modulo') // Verifica permissão
  // ...
}
```

### 6. Adicionar à navegação

Atualizar `src/lib/rbac.ts`:

```typescript
export const ALL_MODULES = [..., 'meu-modulo'] as const
```

Atualizar `src/components/layout/Sidebar.tsx`:

```typescript
const navItems: NavItem[] = [
  // ...
  { href: '/meu-modulo', icon: MeuIcone, label: 'Meu Módulo', module: 'meu-modulo' },
]
```

Atualizar check constraint na migration de `member_permissions`:

```sql
ALTER TABLE member_permissions DROP CONSTRAINT IF EXISTS ...;
ALTER TABLE member_permissions ADD CHECK (module IN (..., 'meu-modulo'));
```

### 7. Testes

Criar em `tests/unit/`:
- Schema tests (100% cobertura)
- Action tests (80% cobertura) — mockar Supabase via `tests/helpers/supabase-mock.ts`

---

## Testes

### Rodar

```bash
pnpm test             # Unitários (Vitest)
pnpm test:watch       # Watch mode
pnpm test:coverage    # Com cobertura
pnpm test:e2e         # E2E (Playwright)
```

### O que testar

- **Schemas Zod**: 100% de cobertura — todos os campos válidos e inválidos
- **Server Actions**: lógica de negócio, casos de erro, guards de permissão
- **Utilitários**: `lib/rate-limit.ts`, `lib/rbac.ts`

### O que NÃO testar

- Componentes visuais sem lógica
- shadcn/ui components
- Estilos CSS

### Mock do Supabase

Usar `tests/helpers/supabase-mock.ts`. O mock usa uma fila de resultados:

```typescript
import { mockResult, resetMocks } from '../helpers/supabase-mock'

beforeEach(() => resetMocks())

it('cria item', async () => {
  // Cada mockResult é consumido por um await na cadeia Supabase
  mockResult({ data: { id: uuid } })  // ownership check
  mockResult({ error: null })          // insert

  const result = await createMeuItem({ title: 'Test' })
  expect(result.success).toBe(true)
})
```
