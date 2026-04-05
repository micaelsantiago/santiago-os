# Santiago OS

Sistema pessoal de organização e produtividade. Centraliza tarefas, projetos, notas, emails e agenda em uma única interface.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript
- **Backend / DB:** Supabase (PostgreSQL + Auth + Storage)
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Estado:** Zustand (UI) + TanStack Query (servidor)
- **Editor:** Tiptap (Markdown)
- **Agente IA:** Claude API (Anthropic)

## Módulos

| Módulo     | Rota        | Descrição                                   |
| ---------- | ----------- | ------------------------------------------- |
| Tarefas    | `/tasks`    | Kanban com colunas configuráveis            |
| Calendário | `/calendar` | Agenda com sync Google Calendar             |
| Projetos   | `/projects` | Kanban por projeto + roadmap                |
| Notas      | `/notes`    | Editor Markdown, pastas, tags               |
| Email      | `/email`    | Inbox unificada IMAP/SMTP                   |
| Agente     | `/agent`    | Assistente IA com acesso a todos os módulos |

## Setup

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Iniciar Supabase local
supabase start
supabase db push

# Iniciar dev server
pnpm dev
```

## Comandos

```bash
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build de produção
pnpm lint         # Linting
pnpm typecheck    # Verificação de tipos
pnpm test         # Testes unitários
pnpm test:e2e     # Testes E2E
```

## Licença

MIT
