<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-000?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Testes-Vitest%20%2B%20Playwright-729b1b?logo=vitest&logoColor=white" alt="Testes" />
</p>

# Santiago OS

Sistema pessoal de organização e produtividade, open source e autogerenciado. Centraliza tarefas, projetos, notas, emails e agenda em uma única interface minimalista.

Inspirado no Notion, Obsidian, Linear e Todoist — com diferencial de integração com n8n, agente IA e notificações ativas.

---

## Funcionalidades

```
┌──────────────────────────────────────┐
│ sidebar 48px │ topbar 44px           │
│ nav icons    │ breadcrumb  ⌘K  +  ≡  │
│              ├───────────────────────-│
│              │ <módulo ativo>         │
│              │                        │
└──────────────────────────────────────┘
```

| Módulo | Rota | Status | Descrição |
|--------|------|--------|-----------|
| Tarefas | `/tasks` | ✅ Implementado | Kanban board com drag-and-drop, colunas configuráveis, tags, filtros |
| Notas | `/notes` | ✅ Implementado | Editor Markdown (Tiptap), pastas, busca full-text |
| Calendário | `/calendar` | 🔲 Planejado | Agenda com sync bidirecional Google Calendar |
| Projetos | `/projects` | 🔲 Planejado | Kanban por projeto + roadmap |
| Email | `/email` | 🔲 Planejado | Inbox unificada IMAP/SMTP |
| Agente | `/agent` | 🔲 Planejado | Assistente IA com acesso a todos os módulos |

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.2 (App Router) |
| Linguagem | TypeScript strict |
| Banco / Auth | Supabase (PostgreSQL + Auth + RLS) |
| CSS | Tailwind CSS v4 |
| Componentes | shadcn/ui |
| Estado UI | Zustand |
| Estado servidor | TanStack Query |
| Formulários | React Hook Form + Zod |
| Editor | Tiptap |
| Drag & Drop | dnd-kit |
| Testes | Vitest + Playwright |
| LLM | Claude API (Anthropic) |
| Linting | ESLint flat config + Prettier |

---

## RBAC — Controle de Acesso

O sistema suporta múltiplos usuários com dois papéis:

| Role | Acesso | Pode deletar? |
|------|--------|---------------|
| **master** | Todos os módulos + settings | Sim |
| **member** | Módulos configurados pelo master | Não |

- O primeiro usuário registrado é automaticamente **master** (imutável)
- O master cria contas de members e configura quais módulos cada um pode acessar
- Members trabalham nos dados do master (workspace compartilhado)
- Proteção em 3 camadas: proxy (route), Server Actions (app), RLS (database)

---

## Segurança

- **RLS** em todas as tabelas com função `is_owner_or_authorized_member()`
- **Security headers**: X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Rate limiting** no login: 5 tentativas / 15min por IP+email (in-memory)
- **Validação UUID** em todos os parâmetros de Server Actions
- **DOMPurify** na sanitização de HTML do editor de notas
- **Zod** como fonte de verdade para validação de inputs
- `user_id` nunca vem do cliente — sempre do servidor

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/login/           # Login + Server Action com rate limit
│   ├── (app)/
│   │   ├── layout.tsx          # Server component → AppShell client
│   │   ├── tasks/              # Kanban board
│   │   ├── notes/              # Editor de notas
│   │   ├── settings/members/   # Gestão de membros (master only)
│   │   └── no-access/          # Página de acesso negado
│   └── api/auth/callback/      # OAuth callback
├── modules/
│   └── {tasks,notes,settings,...}/
│       ├── actions/            # Server Actions
│       ├── components/         # Componentes do módulo
│       ├── queries/            # TanStack Query options
│       ├── store/              # Zustand (UI state)
│       └── types/              # Zod schemas + tipos
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── layout/                 # Sidebar, Topbar, CommandPalette, AppShell
│   └── shared/
├── lib/
│   ├── supabase/               # Clients + get-user + database.types
│   ├── rbac.ts                 # Constantes de módulos
│   ├── rate-limit.ts           # Rate limiter in-memory
│   └── utils.ts
└── styles/
    ├── tokens.css              # Design tokens (cores, tipografia, spacing)
    └── components.css          # Estilos de componentes

supabase/migrations/            # Migrations SQL idempotentes
tests/
├── unit/                       # Vitest
├── e2e/                        # Playwright
└── helpers/                    # Mocks compartilhados
```

---

## Setup

### Pré-requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Instalação

```bash
# Clonar e instalar
git clone https://github.com/micaelsantiago/santiago-os.git
cd santiago-os
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com as credenciais do Supabase

# Iniciar Supabase local e aplicar migrations
supabase start
supabase db push

# Iniciar dev server
pnpm dev
```

### Variáveis de Ambiente

```env
# Obrigatórias
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # Usado apenas para criar members

# Opcionais (habilitar conforme necessário)
ANTHROPIC_API_KEY=                   # Módulo Agente
GOOGLE_CLIENT_ID=                    # Google Calendar sync
GOOGLE_CLIENT_SECRET=
GOOGLE_CALENDAR_API_KEY=
TELEGRAM_BOT_TOKEN=                  # Notificações Telegram
N8N_WEBHOOK_URL=                     # Integração n8n
N8N_API_KEY=
RESEND_API_KEY=                      # Notificações email
RESEND_FROM_EMAIL=
```

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm lint` | Linting (ESLint + Prettier) |
| `pnpm lint:fix` | Auto-fix de lint |
| `pnpm typecheck` | Verificação de tipos |
| `pnpm test` | Testes unitários (Vitest) |
| `pnpm test:watch` | Testes em modo watch |
| `pnpm test:coverage` | Cobertura de testes |
| `pnpm test:e2e` | Testes E2E (Playwright) |
| `supabase start` | Iniciar Supabase local |
| `supabase db push` | Aplicar migrations |
| `supabase gen types typescript --local` | Regenerar database.types.ts |

---

## Convenções

- **Commits**: `tipo(escopo): descrição em português` ([Conventional Commits](https://www.conventionalcommits.org/))
- **Componentes**: Server Component por padrão, `"use client"` só quando necessário
- **Exports**: Sempre `named export`, nunca `default export`
- **Mutações**: Sempre via Server Actions, nunca Supabase direto no cliente
- **Tipos**: Zod schemas são fonte de verdade, tipos inferidos com `z.infer`
- **Imports**: Sempre via alias `@/`, nunca caminhos relativos

---

## Documentação

| Doc | Descrição |
|-----|-----------|
| [Getting Started](docs/getting-started.md) | Setup passo-a-passo |
| [Arquitetura](docs/architecture.md) | Fluxo de dados, decisões, estrutura |
| [Database](docs/database.md) | Schema, RLS, migrations |
| [Auth & RBAC](docs/auth.md) | Login, roles, controle de acesso |
| [Segurança](docs/security.md) | Modelo de segurança, checklist |
| [Tarefas](docs/modules/tasks.md) | Módulo Kanban |
| [Notas](docs/modules/notes.md) | Módulo de notas |
| [Settings](docs/modules/settings.md) | Gestão de members |
| [Contributing](docs/contributing.md) | Convenções, como criar módulos |

---

## Roadmap

| Fase | Módulos | Status |
|------|---------|--------|
| 1 | Auth + Layout + Notas | ✅ |
| 2 | Tarefas (Kanban) | ✅ |
| 3 | Calendário + sync Google | 🔲 |
| 4 | Projetos | 🔲 |
| 5 | Email | 🔲 |
| 6 | Notificações + Telegram | 🔲 |
| 7 | Agente Secretário | 🔲 |
| 8 | n8n + integrações avançadas | 🔲 |

---

## Licença

MIT
