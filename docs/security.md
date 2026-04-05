# Segurança

Modelo de segurança, medidas implementadas e checklist para novos recursos.

---

## Modelo de Ameaças

Santiago OS é uma aplicação pessoal/small-team. O modelo considera:

- **Usuários autenticados maliciosos** (member tentando escalar privilégios)
- **Ataques externos** (brute force, XSS, clickjacking)
- **Exposição acidental** (secrets em código, IDOR)

Não está no escopo: DDoS volumétrico, ataques de side-channel, compliance regulatório.

---

## Medidas Implementadas

### 1. Autenticação

| Medida | Detalhes |
|--------|----------|
| Sessão server-side | Supabase Auth com cookies httpOnly via `@supabase/ssr` |
| Rate limiting no login | 5 tentativas / 15min por IP+email (`src/lib/rate-limit.ts`) |
| Mensagem genérica de erro | "Email ou senha incorretos" — nunca revela se email existe |
| Login via Server Action | Credenciais nunca passam por client-side fetch direto |

### 2. Autorização

| Medida | Detalhes |
|--------|----------|
| RLS em todas as tabelas | Políticas com `is_owner_or_authorized_member()` |
| `effectiveUserId` no servidor | `user_id` nunca vem do cliente |
| Guard de delete | Server Actions bloqueiam delete para role `member` |
| Gate de módulo | `proxy.ts` + Server Actions verificam permissão |
| Master imutável | Trigger PostgreSQL impede alteração de role ou deleção |

### 3. Validação de Input

| Medida | Detalhes |
|--------|----------|
| Zod em toda Server Action | Validação antes de qualquer query |
| UUID validation | Parâmetros `id` validados com `z.string().uuid()` |
| DOMPurify no editor | HTML sanitizado antes de salvar notas |

### 4. Headers HTTP

Configurados em `next.config.ts`:

| Header | Valor | Proteção |
|--------|-------|----------|
| X-Frame-Options | DENY | Clickjacking |
| X-Content-Type-Options | nosniff | MIME sniffing |
| Referrer-Policy | strict-origin-when-cross-origin | Leak de URLs |
| Strict-Transport-Security | max-age=31536000; includeSubDomains | Downgrade HTTPS |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | APIs desnecessárias |

### 5. Secrets

| Regra | Detalhes |
|-------|----------|
| `NEXT_PUBLIC_*` é público | Nunca colocar secrets com esse prefixo |
| `SUPABASE_SERVICE_ROLE_KEY` | Usado apenas em member management, nunca em actions de user |
| `.env.local` no `.gitignore` | Credenciais nunca vão para o repositório |
| `.mcp.json` no `.gitignore` | Config de MCP servers nunca commitada |

---

## Checklist para Novos Recursos

Ao implementar um novo módulo ou feature, verificar:

### Server Action

- [ ] Chama `getAuthenticatedUserWithRole()` como primeira instrução
- [ ] Usa `effectiveUserId` (nunca `user.id` direto) para queries
- [ ] Valida input com Zod antes de qualquer operação
- [ ] Valida parâmetros `id` com `z.string().uuid()`
- [ ] Delete actions têm guard `if (!isMaster)`
- [ ] Retorna `{ error }` ou `{ success, data }` — nunca throw
- [ ] Chama `revalidatePath()` após mutações

### Database

- [ ] Tabela tem `user_id` referenciando `auth.users(id) ON DELETE CASCADE`
- [ ] RLS habilitado (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Policy SELECT/INSERT/UPDATE usa `is_owner_or_authorized_member(user_id)`
- [ ] Policy DELETE usa `auth.uid() = user_id` (só master)
- [ ] Junction tables verificam ownership via tabela pai
- [ ] Migration é idempotente (`IF NOT EXISTS`)

### Frontend

- [ ] Dados sensíveis nunca no client-side (IDs, tokens)
- [ ] HTML de usuários sanitizado com DOMPurify antes de renderizar
- [ ] Formulários usam `type="password"` para senhas
- [ ] Erros de auth mostram mensagens genéricas

### Infraestrutura

- [ ] Novas env vars documentadas em `.env.example`
- [ ] Secrets nunca têm prefixo `NEXT_PUBLIC_`
- [ ] Novos endpoints em `/api` têm autenticação própria

---

## Vulnerabilidades Conhecidas

Rastreadas na issue [#34](https://github.com/micaelsantiago/santiago-os/issues/34).

Itens pendentes:
- **Content-Security-Policy (CSP)**: Não implementado. Complexo com Next.js (inline scripts). Considerar nonces quando necessário.
- **Rate limiting escalável**: Atual é in-memory (reset no restart). Para multi-instance, migrar para Upstash Redis.

---

Próximo: [Módulo de Tarefas](./modules/tasks.md)
