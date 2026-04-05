# Arquitetura

Visão geral de como o Santiago OS funciona, como os dados fluem e por que as decisões foram tomadas.

---

## Visão Geral

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser    │────▶│   Next.js    │────▶│    Supabase     │
│  (React 19)  │◀────│   (App Router)│◀────│  (PostgreSQL)   │
└─────────────┘     └──────────────┘     └─────────────────┘
      │                    │                      │
   Zustand            Server Actions           RLS Policies
   (UI state)         (mutations)              (data isolation)
      │                    │                      │
   TanStack Query     Zod validation          is_owner_or_
   (server state)     + auth check            authorized_member()
```

### Princípios

1. **Server-first** — Server Components por padrão. `"use client"` só com interatividade.
2. **Mutations via Server Actions** — Nunca Supabase direto no cliente para escrita.
3. **3 camadas de segurança** — Proxy (route), Server Action (app), RLS (database).
4. **Módulos independentes** — Cada módulo tem seus próprios actions, componentes, tipos e store.
5. **Zod como fonte de verdade** — Tipos TypeScript são sempre inferidos dos schemas Zod.

---

## Fluxo de uma Request

### Leitura (ex: abrir `/tasks`)

```
1. Browser navega para /tasks
2. proxy.ts intercepta → verifica sessão Supabase
   ├── Sem sessão → redirect /login
   ├── Member sem permissão → redirect /no-access
   └── OK → continua
3. (app)/layout.tsx (Server Component)
   └── getAuthenticatedUserWithRole() → busca profile + role
   └── Busca allowedModules para member
   └── Renderiza AppShell com props
4. tasks/page.tsx (Server Component)
   └── getOrCreateDefaultBoard() → busca/cria board
   └── Renderiza TasksPageClient com dados iniciais
5. TasksPageClient (Client Component)
   └── TanStack Query faz refetch periódico
   └── Zustand gerencia UI state (drag, seleção)
```

### Escrita (ex: criar tarefa)

```
1. Usuário preenche form e submete
2. Client chama createTask(input) — Server Action
3. Server Action:
   a. getAuthenticatedUserWithRole() → verifica auth + busca role
   b. createTaskSchema.safeParse(input) → valida com Zod
   c. supabase.from('tasks').insert({ ...data, user_id: effectiveUserId })
      └── effectiveUserId = master's ID (mesmo para members)
   d. RLS verifica: is_owner_or_authorized_member(user_id)
   e. revalidatePath('/tasks') → invalida cache
   f. Retorna { success: true, data } ou { error: '...' }
4. Client recebe resultado → atualiza UI
```

---

## Estrutura de Diretórios

```
src/
├── app/                          # Rotas Next.js (App Router)
│   ├── (auth)/login/             # Grupo de rotas públicas
│   │   ├── page.tsx              # Página de login (Server)
│   │   ├── LoginForm.tsx         # Form (Client)
│   │   └── login.action.ts      # Server Action com rate limit
│   ├── (app)/                    # Grupo de rotas protegidas
│   │   ├── layout.tsx            # Server wrapper → busca role + permissions
│   │   ├── tasks/page.tsx
│   │   ├── notes/page.tsx
│   │   ├── settings/members/     # Gestão de members (master only)
│   │   └── no-access/page.tsx
│   └── api/
│       └── auth/callback/        # OAuth callback (PKCE)
│
├── modules/                      # Lógica de negócio por domínio
│   └── {tasks,notes,settings}/
│       ├── actions/              # Server Actions ('use server')
│       ├── components/           # Componentes React do módulo
│       ├── queries/              # queryOptions() para TanStack Query
│       ├── store/                # Zustand store (UI state apenas)
│       └── types/                # Zod schemas + tipos inferidos
│
├── components/
│   ├── ui/                       # shadcn/ui — NÃO editar
│   ├── layout/                   # Shell, Sidebar, Topbar, CommandPalette
│   └── shared/                   # Providers, componentes reutilizáveis
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient (client-side)
│   │   ├── server.ts             # createServerClient (server-side)
│   │   ├── get-user.ts           # getAuthenticatedUser[WithRole]()
│   │   └── database.types.ts     # Gerado — nunca editar à mão
│   ├── rbac.ts                   # ALL_MODULES, extractModuleFromPath
│   ├── rate-limit.ts             # Sliding window rate limiter
│   ├── query-client.ts           # React Query config
│   └── utils.ts                  # cn() helper
│
└── styles/
    ├── tokens.css                # CSS custom properties (cores, fontes)
    └── components.css            # Estilos de layout e componentes
```

---

## Estado da Aplicação

O Santiago OS separa estritamente estado de UI e estado do servidor:

| Tipo | Ferramenta | Onde | Exemplos |
|------|-----------|------|----------|
| **Server state** | TanStack Query | `modules/*/queries/` | Tarefas, notas, colunas |
| **UI state** | Zustand | `modules/*/store/` | Nota selecionada, painel aberto |
| **Form state** | React Hook Form | Componentes client | Campos do formulário |
| **Auth state** | Supabase Auth | Cookies (server-side) | Sessão do usuário |

### Por que essa separação?

- **TanStack Query** gerencia cache, refetch, stale time e loading states automaticamente. Não precisamos duplicar dados do servidor no Zustand.
- **Zustand** é apenas para estado efêmero de UI que não existe no banco (ex: "qual nota está selecionada", "o dialog está aberto").
- **Nunca** colocar dados do servidor no Zustand. Se precisa de dados, use `useQuery()`.

---

## Padrão de Server Actions

Toda Server Action segue este template:

```typescript
'use server'

export async function createThing(input: CreateThingInput) {
  // 1. Auth + role
  const { supabase, effectiveUserId, isMaster } = await getAuthenticatedUserWithRole()

  // 2. Validação
  const parsed = createThingSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  // 3. Guard de permissão (se necessário)
  if (!isMaster) return { error: 'Membros não podem deletar recursos' }

  // 4. Query
  const { data, error } = await supabase
    .from('things')
    .insert({ ...parsed.data, user_id: effectiveUserId })
    .select()
    .single()

  // 5. Tratamento de erro (nunca throw)
  if (error) return { error: 'Erro ao criar' }

  // 6. Invalidar cache
  revalidatePath('/things')

  // 7. Retorno tipado
  return { success: true, data: data as Thing }
}
```

### Regras

- Retorno sempre `{ error }` ou `{ success, data }` — nunca throw
- `effectiveUserId` em vez de `user.id` — suporta RBAC
- Validação Zod **antes** de qualquer query
- `revalidatePath()` após mutações

---

## Design System

O Santiago OS usa um design system minimalista inspirado no Linear e Vercel.

### Tokens principais

Definidos em `src/styles/tokens.css` como CSS custom properties:

- **Cores**: `--color-bg`, `--color-text`, `--color-accent`, `--color-danger`, etc.
- **Tipografia**: Inter/Geist, pesos 400 e 500 apenas, tamanhos 11-16px
- **Bordas**: Sempre `0.5px`
- **Raios**: `--radius-sm` (4px), `--radius` (6px), `--radius-lg` (10px)
- **Sombras**: Apenas focus ring (`box-shadow: 0 0 0 2px var(--color-accent)`)
- **Animações**: Máximo `150ms ease`
- **Ícones**: Lucide React, `size={16}`, `strokeWidth={1.5}`

### Suporte a dark mode

Tokens redefinidos sob `.dark` / `[data-theme='dark']` em `tokens.css`.

---

Próximo: [Database](./database.md)
