# CLAUDE.md — Santiago OS

Este arquivo guia o Claude Code ao trabalhar neste repositório. Leia-o antes de qualquer tarefa.

---

## Visão do Projeto

**Santiago OS** é um sistema pessoal de organização e produtividade, open source, autogerenciado. Centraliza tarefas, projetos, notas, emails e agenda em uma única interface.

Inspirações: Notion, Obsidian, Linear, Todoist. Diferencial: integração com n8n, agente IA e notificações ativas.

---

## Stack Técnico

| Camada          | Decisão                                      |
| --------------- | -------------------------------------------- |
| Frontend        | Next.js 16.2 (App Router)                    |
| Linguagem       | TypeScript strict                            |
| Backend / DB    | Supabase (PostgreSQL + Auth + Storage)       |
| CSS             | Tailwind CSS v4                              |
| UI components   | shadcn/ui                                    |
| Estado global   | Zustand                                      |
| Estado servidor | TanStack Query                               |
| Formulários     | React Hook Form + Zod                        |
| Editor Markdown | Tiptap                                       |
| Testes          | Vitest (unit/integration) + Playwright (E2E) |
| LLM / Agente    | Anthropic Claude API (sonnet + haiku)        |
| Notificações    | Resend (email) + Telegram Bot API            |
| Linting         | ESLint flat config + Prettier                |
| Commits         | Conventional Commits                         |

### Next.js 16 — mudanças críticas vs 15

- `middleware.ts` → **`proxy.ts`**, export `proxy` (não `middleware`), runtime Node.js obrigatório
- Turbopack é padrão — não adicionar `--turbopack` nos scripts
- `'use cache'` substitui `experimental.ppr` — caching é opt-in
- React Compiler estável via `reactCompiler: true` (desabilitado por padrão)

---

## Módulos do Sistema

| Módulo       | Rota        | Descrição                                                 |
| ------------ | ----------- | --------------------------------------------------------- |
| Tarefas      | `/tasks`    | Kanban com colunas configuráveis, drag-and-drop, filtros  |
| Calendário   | `/calendar` | Agenda com sync bidirecional Google Calendar              |
| Projetos     | `/projects` | Kanban por projeto + roadmap, reutiliza módulo de Tarefas |
| Notas        | `/notes`    | Editor Markdown, pastas, links internos `[[nota]]`, tags  |
| Email        | `/email`    | Cliente IMAP/SMTP, inbox unificada, criar tarefa de email |
| Notificações | —           | Email + Telegram, lembretes, resumo diário                |
| Agente       | `/agent`    | Assistente IA com acesso a todos os módulos via tool use  |
| Integrações  | —           | n8n, Google Calendar, Google Drive, Telegram              |

---

## Arquitetura de Referência

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          # sidebar + command palette
│   │   ├── tasks/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── notes/page.tsx
│   │   ├── email/page.tsx
│   │   └── agent/page.tsx
│   └── api/
│       ├── webhooks/n8n/route.ts
│       └── auth/callback/route.ts
├── modules/
│   └── {tasks,calendar,projects,notes,email,notifications,agent,integrations}/
│       ├── components/
│       ├── hooks/
│       ├── actions/        # Server Actions
│       ├── queries/        # TanStack Query options
│       ├── store/          # Zustand (UI state)
│       ├── types/          # Zod schemas + tipos inferidos
│       └── index.ts
├── components/
│   ├── ui/                 # shadcn/ui — não editar
│   ├── layout/             # Sidebar, Topbar, CommandPalette
│   └── shared/
└── lib/
    ├── supabase/
    │   ├── client.ts       # createBrowserClient
    │   ├── server.ts       # createServerClient
    │   └── database.types.ts  # gerado — nunca editar à mão
    ├── query-client.ts
    └── utils.ts

supabase/migrations/
tests/{unit,integration,e2e}/
```

---

## Convenções de Código

### Nomenclatura

| O quê                  | Padrão            | Exemplo                     |
| ---------------------- | ----------------- | --------------------------- |
| Arquivos de componente | `PascalCase`      | `TaskCard.tsx`              |
| Hooks                  | `camelCase`       | `useTaskBoard.ts`           |
| Utilitários / stores   | `kebab-case`      | `task-store.ts`             |
| Tipos                  | `kebab-case`      | `task.types.ts`             |
| Constantes globais     | `SCREAMING_SNAKE` | `MAX_COLUMNS_PER_BOARD`     |
| Tipos / interfaces TS  | `PascalCase`      | `TaskCard`, `BoardColumn`   |
| Rotas                  | `kebab-case`      | `/tasks/[task-id]/page.tsx` |

### Componentes

- Server Component por default — `"use client"` apenas quando necessário
- Sempre `named export` — nunca `default export`
- Props tipadas com `interface`, nunca `type`

```tsx
// ✅ Server Component (padrão)
export async function TaskBoard() {
  const tasks = await getTasks()
  return (
    <div>
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}
    </div>
  )
}

// ✅ Client Component — apenas com interatividade
;('use client')
export function TaskCard({ task }: { task: Task }) {
  const [open, setOpen] = useState(false)
}
```

### Server Actions

Toda mutação passa por Server Actions. Nunca Supabase direto no cliente.

```ts
'use server'
export async function createTask(input: CreateTaskInput) {
  const { supabase, user } = await getAuthenticatedUser() // sempre primeiro
  const parsed = createTaskSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }
  const { error } = await supabase.from('tasks').insert({ ...parsed.data, user_id: user.id })
  if (error) return { error: 'Erro ao criar tarefa' }
  revalidatePath('/tasks')
  return { success: true }
}
```

Retorno sempre `{ error }` ou `{ success, data }` — nunca jogar exceção.

### Tipagem com Zod

Schema Zod é a fonte da verdade. Tipos sempre inferidos, nunca escritos à mão.

```ts
export const taskSchema = z.object({
  title: z.string().min(1).max(255),
  priority: z.enum(['low', 'medium', 'high']),
  column_id: z.string().uuid(),
  due_date: z.string().datetime().optional(),
})
export type Task = z.infer<typeof taskSchema>
export type CreateTaskInput = z.infer<typeof taskSchema>
```

### Estado

- **Zustand** — apenas estado de UI (painel aberto, item selecionado). Nunca dados do servidor.
- **TanStack Query** — todo dado do servidor. Usar `queryOptions()` nos arquivos `queries/`.

### Imports

Sempre aliases. Nunca `../../..`.

```ts
import { TaskCard } from '@/modules/tasks/components/TaskCard'
import { Button } from '@/components/ui/button'
```

### Commits

`tipo(escopo): descrição em português`

Tipos: `feat` `fix` `chore` `docs` `refactor` `test` `perf`

Branches: `main` → produção · `dev` → desenvolvimento · `feat/nome` `fix/nome`

### TypeScript

- `strict: true` sem exceções
- Sem `any` sem justificativa
- `@ts-ignore` proibido — usar `@ts-expect-error` com comentário
- `interface` para formas de objetos, `type` para uniões e utilitários

---

## Design System

Estilo: **minimalista e limpo** (Linear, Vercel). Bordas `0.5px`, sem gradientes, sem sombras decorativas.

### Tokens (`src/styles/tokens.css`)

```css
:root {
  --color-bg: #ffffff;
  --color-bg-2: #f7f7f5;
  --color-bg-3: #f0efec;
  --color-text: #0a0a0a;
  --color-text-2: #6b6b6b;
  --color-text-3: #a0a0a0;
  --color-border: #e5e5e3;
  --color-border-2: #d0d0ce;
  --color-accent: #5746af;
  --color-accent-bg: #eeedf8;
  --color-accent-text: #3d318f;
  --color-success: #3b6d11;
  --color-success-bg: #eaf3de;
  --color-warning: #854f0b;
  --color-warning-bg: #faeeda;
  --color-danger: #a32d2d;
  --color-danger-bg: #fcebeb;
  --color-info: #185fa5;
  --color-info-bg: #e6f1fb;
  --font: 'Inter', 'Geist', system-ui, sans-serif;
  --font-mono: 'GeistMono', 'JetBrains Mono', monospace;
  --radius-sm: 4px;
  --radius: 6px;
  --radius-lg: 10px;
  --radius-xl: 14px;
  --sidebar-width: 48px;
  --topbar-height: 44px;
}
.dark,
[data-theme='dark'] {
  --color-bg: #111110;
  --color-bg-2: #1a1a18;
  --color-bg-3: #222220;
  --color-text: #f0efec;
  --color-text-2: #888785;
  --color-text-3: #555553;
  --color-border: #2a2a28;
  --color-border-2: #3a3a38;
  --color-accent: #7c6de0;
  --color-accent-bg: #1e1a3a;
  --color-accent-text: #a99ef0;
  --color-success: #97c459;
  --color-success-bg: #172a0a;
  --color-warning: #ef9f27;
  --color-warning-bg: #2a1e08;
  --color-danger: #f09595;
  --color-danger-bg: #2a1010;
  --color-info: #85b7eb;
  --color-info-bg: #0c1e2e;
}
```

### Tipografia

Pesos: apenas `400` e `500`. Nunca `600`, `700` ou `bold`.

| Tamanho | Peso | Uso                       |
| ------- | ---- | ------------------------- |
| 11px    | 400  | Labels uppercase, atalhos |
| 12px    | 400  | Metadata, datas           |
| 13px    | 400  | Corpo padrão              |
| 14px    | 500  | Títulos de card           |
| 16px    | 500  | Títulos de página         |

### Layout shell

```
┌──────────────────────────────────────┐
│ sidebar 48px │ topbar 44px           │
│ nav icons   │ breadcrumb  ⌘K  +  ≡  │
│             ├───────────────────────-│
│             │ <módulo ativo>          │
│             │ bg: --color-bg-3        │
└──────────────────────────────────────┘
```

Sidebar é fixa em 48px (somente ícones, sem estado expandido). Navegação por texto via Command Palette (`⌘K`).

### Command Palette (navegação principal)

- Atalho: `⌘K` / `Ctrl+K`
- Fechar: `Esc` · Navegar: `↑↓` · Confirmar: `Enter`
- Overlay `rgba(0,0,0,0.3)`, palette `480px` centralizada, `80px` do topo

```ts
interface PaletteItem {
  id: string
  label: string
  icon: LucideIcon
  shortcut?: string
  action: () => void
  section: 'navigate' | 'create' | 'recent' | 'settings'
}
```

### Ícones

Lucide React — `size={16}` `strokeWidth={1.5}`.

### Badges de prioridade / status

| Estado       | Background / Texto                          |
| ------------ | ------------------------------------------- |
| Alta         | `--color-danger-bg` / `--color-danger`      |
| Média        | `--color-warning-bg` / `--color-warning`    |
| Baixa        | `--color-success-bg` / `--color-success`    |
| Em progresso | `--color-accent-bg` / `--color-accent-text` |

### Regras absolutas de UI

1. Bordas sempre `0.5px` — nunca `1px` ou mais
2. Nenhuma cor hardcoded — sempre CSS variables
3. Sombra apenas para focus ring: `box-shadow: 0 0 0 2px var(--color-accent)`
4. Animações máximo `150ms ease`
5. Fundo de página: `--color-bg-3` · Componentes: `--color-bg`

---

## Schema do Banco de Dados

Convenções: `snake_case`, IDs `uuid` com `gen_random_uuid()`, timestamps `timestamptz`, sem soft delete (usar `is_archived`). Tokens sensíveis via **Supabase Vault**. Tipos TypeScript gerados via `supabase gen types` — nunca escrever à mão.

RLS habilitado em todas as tabelas. Aplicar este padrão a cada tabela:

```sql
alter table {tabela} enable row level security;
create policy "select own" on {tabela} for select using (auth.uid() = user_id);
create policy "insert own" on {tabela} for insert with check (auth.uid() = user_id);
create policy "update own" on {tabela} for update using (auth.uid() = user_id);
create policy "delete own" on {tabela} for delete using (auth.uid() = user_id);
```

### Tabelas

Ordem de criação importa — `projects` antes de `boards` (referência direta).

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text, avatar_url text,
  timezone text default 'America/Sao_Paulo',
  theme text default 'system',
  created_at timestamptz default now()
);
-- RLS para profiles usa `id`, não `user_id`
alter table profiles enable row level security;
create policy "select own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, description text,
  status text default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  start_date date, end_date date,
  created_at timestamptz default now()
);

create table boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  type text default 'tasks' check (type in ('tasks', 'project')),
  project_id uuid references projects(id) on delete cascade,
  created_at timestamptz default now()
);

create table columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, position int not null, color text
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  column_id uuid references columns(id) on delete cascade not null,
  title text not null, description text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  status text default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  position int not null, due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table task_tags (
  task_id uuid references tasks(id) on delete cascade,
  tag text not null, primary key (task_id, tag)
);
-- RLS para task_tags: acesso via ownership da task pai
alter table task_tags enable row level security;
create policy "select own task_tags" on task_tags for select
  using (task_id in (select id from tasks where user_id = auth.uid()));
create policy "insert own task_tags" on task_tags for insert
  with check (task_id in (select id from tasks where user_id = auth.uid()));
create policy "delete own task_tags" on task_tags for delete
  using (task_id in (select id from tasks where user_id = auth.uid()));

create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, description text, location text,
  start_at timestamptz not null, end_at timestamptz not null,
  all_day boolean default false,
  recurrence text,
  google_event_id text unique,
  source text default 'local' check (source in ('local', 'google')),
  created_at timestamptz default now()
);

create table note_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  parent_id uuid references note_folders(id) on delete cascade,
  title text not null, position int default 0
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  folder_id uuid references note_folders(id) on delete set null,
  title text not null default 'Sem título',
  content text default '',
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table note_tags (
  note_id uuid references notes(id) on delete cascade,
  tag text not null, primary key (note_id, tag)
);
-- RLS para note_tags: acesso via ownership da nota pai
alter table note_tags enable row level security;
create policy "select own note_tags" on note_tags for select
  using (note_id in (select id from notes where user_id = auth.uid()));
create policy "insert own note_tags" on note_tags for insert
  with check (note_id in (select id from notes where user_id = auth.uid()));
create policy "delete own note_tags" on note_tags for delete
  using (note_id in (select id from notes where user_id = auth.uid()));

create table email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null, email text not null,
  provider text not null,
  imap_host text, imap_port int, smtp_host text, smtp_port int,
  -- access_token e refresh_token encriptados via Supabase Vault
  -- usar vault.create_secret() para gravar, vault.decrypted_secrets para ler
  access_token text, refresh_token text,
  is_active boolean default true, last_sync_at timestamptz,
  created_at timestamptz default now()
);

create table emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references email_accounts(id) on delete cascade not null,
  message_id text not null,
  subject text, sender_name text, sender_email text not null,
  recipients jsonb default '[]',
  snippet text, body_html text, body_text text,
  labels text[] default '{}',
  is_read boolean default false,
  is_starred boolean default false,
  is_archived boolean default false,
  received_at timestamptz not null,
  unique(account_id, message_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, title text not null, body text, link text,
  is_read boolean default false,
  source_id uuid, source_type text,
  created_at timestamptz default now()
);

create table notification_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean default true,
  telegram_enabled boolean default false, telegram_chat_id text,
  task_reminders boolean default true,
  event_reminders boolean default true,
  daily_summary boolean default false,
  daily_summary_time time default '08:00'
);
-- RLS para notification_settings: user_id é a PK
alter table notification_settings enable row level security;
create policy "select own settings" on notification_settings for select using (auth.uid() = user_id);
create policy "insert own settings" on notification_settings for insert with check (auth.uid() = user_id);
create policy "update own settings" on notification_settings for update using (auth.uid() = user_id);

create table agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references agent_conversations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null,
  content text not null,
  tool_calls jsonb, tool_results jsonb, tokens_used int,
  created_at timestamptz default now()
);

create table integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null,
  is_active boolean default true,
  config jsonb default '{}',
  access_token text,
  created_at timestamptz default now(),
  unique(user_id, provider)
);
```

### Índices

```sql
-- tasks: queries mais comuns
create index on tasks (column_id);
create index on tasks (user_id, due_date) where due_date is not null;

-- emails: paginação e filtros
create index on emails (account_id, received_at desc);
create index on emails (user_id, is_read, is_archived);

-- notes: busca e listagem
create index on notes (user_id, updated_at desc);
create index on notes using gin (to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(content, '')));

-- events: consulta por período
create index on events (user_id, start_at, end_at);

-- agent_messages: rate limiting e histórico
create index on agent_messages (user_id, role, created_at desc);
```

### Trigger `updated_at`

Aplicar nas tabelas `tasks`, `notes` e `agent_conversations`:

```sql
create extension if not exists moddatetime;
create trigger handle_updated_at before update on tasks
  for each row execute procedure moddatetime(updated_at);
create trigger handle_updated_at before update on notes
  for each row execute procedure moddatetime(updated_at);
create trigger handle_updated_at before update on agent_conversations
  for each row execute procedure moddatetime(updated_at);
```

---

## Autenticação e Segurança

### proxy.ts

```ts
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (c) =>
          c.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const pub = ['/login', '/auth/callback'].some((p) => request.nextUrl.pathname.startsWith(p))
  if (!user && !pub) return NextResponse.redirect(new URL('/login', request.url))
  if (user && request.nextUrl.pathname === '/login')
    return NextResponse.redirect(new URL('/tasks', request.url))
  return response
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'] }
```

> **Nota:** rotas `/api` ficam fora do proxy. Webhooks (ex: n8n) devem validar autenticação própria via header `Authorization: Bearer <N8N_API_KEY>`. Auth callback é protegido pelo fluxo PKCE do Supabase.

### Helper obrigatório em toda Server Action

```ts
// src/lib/supabase/get-user.ts
export async function getAuthenticatedUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')
  return { supabase, user }
}
```

### Regras de segurança

1. `user_id` **nunca** do cliente — sempre de `user.id` do servidor
2. Validação Zod **antes** de qualquer query
3. `SUPABASE_SERVICE_ROLE_KEY` nunca em Server Actions de usuário
4. Tokens OAuth/SMTP via **Supabase Vault** — nunca em `text` simples
5. Markdown renderizado com **DOMPurify** (evitar XSS)
6. `NEXT_PUBLIC_*` é público — segredos nunca recebem esse prefixo
7. Agente: máximo **20 req/min** por usuário

```ts
// src/modules/agent/lib/rate-limit.ts
export async function checkAgentRateLimit(userId: string): Promise<boolean> {
  const supabase = await createServerClient()
  const windowStart = new Date(Date.now() - 60_000).toISOString()
  const { count } = await supabase
    .from('agent_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', windowStart)
  return (count ?? 0) < 20
}
```

> **Nota:** rate limit via SELECT pode sofrer race condition sob carga. Para produção, considerar rate limit no nível do banco (pg advisory lock) ou via cache externo (Upstash Redis).

---

## Estratégia de Testes

### O que testar — Vitest (obrigatório)

- Schemas Zod — 100% de cobertura
- Server Actions — lógica de negócio e casos de erro
- Utilitários em `lib/`
- Rate limiting do Agente

### O que testar — Playwright E2E (obrigatório)

- Login → dashboard
- Criar tarefa → aparece no board
- `⌘K` → navegar entre módulos
- Criar nota → salvar → reabrir

### O que NÃO testar

Componentes visuais sem lógica, shadcn/ui, estilos CSS.

### Mock do Supabase em testes unitários

Server Actions dependem do Supabase. Mockar no nível do módulo:

```ts
// tests/helpers/supabase-mock.ts
import { vi } from 'vitest'

export const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}))

vi.mock('@/lib/supabase/get-user', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({
    supabase: mockSupabaseClient,
    user: { id: 'test-user-id', email: 'test@test.com' },
  }),
}))
```

```ts
// uso em test
import { mockSupabaseClient } from '@/tests/helpers/supabase-mock'

it('cria tarefa', async () => {
  mockSupabaseClient.insert.mockResolvedValueOnce({ error: null })
  const result = await createTask({ title: 'ok', priority: 'high', column_id: 'uuid' })
  expect(result.success).toBe(true)
})
```

### Padrão de escrita

```ts
describe('createTaskSchema', () => {
  it('valida input correto', () => {
    expect(
      createTaskSchema.safeParse({ title: 'ok', priority: 'high', column_id: 'uuid' }).success,
    ).toBe(true)
  })
  it('rejeita título vazio', () => {
    expect(
      createTaskSchema.safeParse({ title: '', priority: 'high', column_id: 'uuid' }).success,
    ).toBe(false)
  })
})
```

### Cobertura mínima

```ts
// vitest.config.ts
coverage: {
  provider: 'v8',
  thresholds: {
    'src/modules/**/types/*.ts':   { lines: 100 },
    'src/modules/**/actions/*.ts': { lines: 80  },
    'src/lib/**/*.ts':             { lines: 80  },
  }
}
```

---

## Contexto para o Claude Code

- Server Component por default — `"use client"` somente quando necessário
- `user_id` nunca do cliente — sempre do servidor
- Cada módulo é independente — sem acoplamentos entre módulos
- Integrações externas com fallback — se Google Calendar cair, calendário local funciona
- Notas armazenam Markdown puro — editor é camada de cima
- Não criar Dockerfiles em dev — Supabase roda via `supabase start`
- Usar `proxy.ts` — nunca `middleware.ts` (Next.js 16)

---

## Comandos

```bash
pnpm install && pnpm dev
pnpm build && pnpm test && pnpm test:e2e
pnpm lint && pnpm typecheck
supabase start && supabase db push
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

---

## Variáveis de Ambiente

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALENDAR_API_KEY=
TELEGRAM_BOT_TOKEN=
N8N_WEBHOOK_URL=
N8N_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

---

## Roadmap

| Fase | Módulos                     |
| ---- | --------------------------- |
| 1    | Auth + Layout + Notas       |
| 2    | Tarefas (Kanban)            |
| 3    | Calendário + sync Google    |
| 4    | Projetos                    |
| 5    | Email                       |
| 6    | Notificações + Telegram     |
| 7    | Agente Secretário           |
| 8    | n8n + integrações avançadas |

---

_Última atualização: 2026-04-03_
