# Getting Started

Guia para rodar o Santiago OS localmente e fazer o primeiro setup.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Instalação |
|-----------|---------------|------------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| pnpm | 9+ | `npm install -g pnpm` |
| Supabase CLI | 1.200+ | `brew install supabase/tap/supabase` ou [docs](https://supabase.com/docs/guides/cli) |
| Docker | 24+ | Necessário para `supabase start` |

---

## 1. Clonar e instalar

```bash
git clone https://github.com/micaelsantiago/santiago-os.git
cd santiago-os
pnpm install
```

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Editar `.env.local` com as credenciais do seu projeto Supabase:

```env
# Obrigatórias
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # Usado para criar members (RBAC)
```

### Onde encontrar as keys

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto → **Settings** → **API**
3. Copie `Project URL`, `anon public` e `service_role` (secret)

> A `service_role` key tem acesso total ao banco. Nunca exponha no cliente.

## 3. Iniciar Supabase local

```bash
supabase start       # Inicia containers Docker (PostgreSQL, Auth, Storage, etc.)
supabase db push     # Aplica todas as migrations
```

Após `supabase start`, você verá as URLs e keys locais no terminal. Para dev local, pode usar essas em vez das do projeto remoto.

## 4. Iniciar o dev server

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000). Você será redirecionado para `/login`.

## 5. Criar o primeiro usuário

Na interface de login, crie uma conta com email e senha. O **primeiro usuário** automaticamente se torna **master** (admin com acesso total). Esse papel é imutável — não pode ser alterado nem deletado.

Após o login, você é redirecionado para `/tasks` com um board Kanban padrão criado automaticamente.

## 6. Criar members (opcional)

Como master, acesse o ícone de engrenagem na sidebar → `/settings/members`:

1. Clique em **Criar membro**
2. Preencha email, senha e nome
3. Selecione os módulos que o member pode acessar
4. O member já pode fazer login com as credenciais criadas

---

## Desenvolvimento

### Comandos úteis

```bash
pnpm dev              # Dev server (Turbopack)
pnpm build            # Build de produção
pnpm lint             # ESLint + Prettier check
pnpm lint:fix         # Auto-fix
pnpm typecheck        # tsc --noEmit
pnpm test             # Vitest (unitários)
pnpm test:watch       # Vitest em watch mode
pnpm test:coverage    # Cobertura de testes
pnpm test:e2e         # Playwright (E2E)
```

### Regenerar tipos do banco

Após alterar migrations ou o schema do banco:

```bash
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

### Resetar banco local

```bash
supabase db reset     # Recria o banco e aplica todas as migrations do zero
```

---

## Troubleshooting

### `supabase start` falha

- Verifique se o Docker está rodando
- Tente `supabase stop` e depois `supabase start` novamente
- Se portas estão ocupadas: `supabase stop --no-backup` e reinicie

### Login redireciona infinitamente

- Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretos no `.env.local`
- Se usando Supabase local, use as keys do output de `supabase start`

### Erros de tipo em `database.types.ts`

- Regenere os tipos: `supabase gen types typescript --local > src/lib/supabase/database.types.ts`
- Certifique-se de que as migrations foram aplicadas: `supabase db push`

---

Próximo: [Arquitetura](./architecture.md)
