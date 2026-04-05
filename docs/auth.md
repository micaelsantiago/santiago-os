# Autenticação & RBAC

Como funciona o login, sessões, roles e controle de acesso no Santiago OS.

---

## Fluxo de Autenticação

```
Browser                    proxy.ts                  Supabase Auth
   │                          │                          │
   ├── GET /tasks ──────────▶│                           │
   │                          ├── getUser() ────────────▶│
   │                          │◀─────── user ou null ────│
   │                          │                           │
   │  [sem sessão]            │                           │
   │◀── redirect /login ──────│                           │
   │                          │                           │
   │  [com sessão]            │                           │
   │  [member?]               ├── check permissions ────▶│
   │  [sem acesso]            │                           │
   │◀── redirect /no-access ──│                           │
   │                          │                           │
   │  [OK]                    │                           │
   │◀── response ─────────────│                           │
```

### Login

1. Usuário submete email/senha no form
2. `LoginForm.tsx` chama `loginAction()` (Server Action)
3. Server Action:
   - Valida input com Zod
   - Verifica rate limit (5 tentativas / 15min por IP+email)
   - Chama `supabase.auth.signInWithPassword()`
   - Retorna `{ success }` ou `{ error }` (mensagem genérica — nunca revela se email existe)
4. Client faz `router.refresh()` → proxy detecta sessão → redirect para `/tasks`

### proxy.ts

O `proxy.ts` (equivalente ao `middleware.ts` de Next.js 15) intercepta **todas** as requests (exceto `/api`, `_next`, assets estáticos):

1. Cria um Supabase server client com cookies da request
2. Valida sessão via `supabase.auth.getUser()`
3. Se não autenticado em rota protegida → redirect `/login`
4. Se autenticado em `/login` → redirect `/tasks`
5. Se member em `/settings/*` → redirect `/no-access`
6. Se member → verifica `member_permissions` para o módulo da rota

---

## RBAC — Master & Member

### Roles

| Role | Descrição | Pode deletar? | Imutável? |
|------|-----------|---------------|-----------|
| **master** | Primeiro usuário registrado. Acesso total. | Sim | Sim — role e conta protegidos por trigger |
| **member** | Criado pelo master. Acesso por módulo. | Não | Não — master pode editar/deletar |

### effectiveUserId

Conceito central do RBAC: todos os dados pertencem ao master. Quando um member cria ou consulta dados, usa o `user_id` do master.

```typescript
const { effectiveUserId, isMaster } = await getAuthenticatedUserWithRole()
// master → effectiveUserId = user.id (o próprio)
// member → effectiveUserId = profile.master_id (o master)
```

Isso significa que:
- Todos trabalham no mesmo "workspace" — dados do master
- O master vê tudo que members criam
- Members entre si veem os mesmos dados (do master)
- Quando um member é deletado, os dados que ele criou continuam (pertencem ao master)

### 3 Camadas de Proteção

| Camada | Arquivo | Verificação |
|--------|---------|-------------|
| **Route** | `src/proxy.ts` | Sessão + permissão de módulo |
| **Application** | Server Actions | `getAuthenticatedUserWithRole()` + guards |
| **Database** | RLS policies | `is_owner_or_authorized_member()` |

Cada camada é independente. Se uma falhar, as outras protegem.

---

## Gestão de Members

### Criar member

O master acessa `/settings/members` e cria contas diretamente:

```
Master → createMember Server Action
  1. Verifica isMaster
  2. Valida input (Zod)
  3. Admin API: supabase.auth.admin.createUser() ← usa SERVICE_ROLE_KEY
  4. Insere profile com role='member' e master_id=master.id
  5. Insere member_permissions (módulos selecionados)
```

> **Nota**: `SUPABASE_SERVICE_ROLE_KEY` é usado **apenas** nas Server Actions de member management. Nunca em actions de usuário regular.

### Atualizar permissões

Replace completo: deleta permissões existentes e insere as novas.

### Deletar member

Remove o auth user via Admin API. Cascade deleta profile e permissions. Dados criados pelo member (que usam `user_id` do master) não são afetados.

---

## Rate Limiting

O login tem rate limiting in-memory (sliding window):

- **Limite**: 5 tentativas por janela de 15 minutos
- **Chave**: `login:{ip}:{email}` — isolado por IP e email
- **Implementação**: `src/lib/rate-limit.ts` (Map-based, reset no restart)
- **Resposta**: `"Muitas tentativas. Tente novamente em X minuto(s)."`

Adequado para single-instance (uso pessoal). Para multi-instance, substituir por Upstash Redis sem mudar a interface `checkRateLimit()`.

---

## Helpers

### getAuthenticatedUser()

```typescript
// Retorna { supabase, user } ou redirect /login
const { supabase, user } = await getAuthenticatedUser()
```

Versão simples, sem informação de role. Usado no login action e em contextos que não precisam de RBAC.

### getAuthenticatedUserWithRole()

```typescript
// Retorna { supabase, user, profile, effectiveUserId, isMaster }
const { supabase, effectiveUserId, isMaster } = await getAuthenticatedUserWithRole()
```

Versão completa. Usado em todas as Server Actions de módulos.

### checkModuleAccess(module)

```typescript
// Retorna AuthResultWithRole ou redirect /no-access
const auth = await checkModuleAccess('tasks')
```

Verifica se o usuário tem acesso ao módulo. Master sempre tem acesso.

---

Próximo: [Segurança](./security.md)
