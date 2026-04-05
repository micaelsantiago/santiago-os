# Módulo: Settings

Gestão de members e permissões. Acessível apenas pelo master.

---

## Visão Geral

- **Rota**: `/settings/members`
- **Status**: Implementado
- **Acesso**: Master only (proxy.ts bloqueia members)
- **Componentes**: `MembersPageClient`

```
┌─ Membros ──────────────────────── [+ Criar membro] ─┐
│                                                       │
│  🛡 Micael Santiago    master   micael@email.com      │
│  ─────────────────────────────────────────────────    │
│  👤 Ana Costa          member   ana@email.com         │
│     Tarefas, Projetos, Notas           [✏️] [��️]     │
│  ─────────────────────────────────────────────────    │
│  👤 João Silva         member   joao@email.com        │
│     Projetos                           [✏️] [🗑️]     │
└───────────────────────────────────────────────────────┘
```

## Funcionalidades

### Criar member

1. Master clica em "Criar membro"
2. Dialog com campos: nome, email, senha, módulos (checkboxes)
3. Server Action `createMember()`:
   - Cria auth user via `supabase.auth.admin.createUser()` (service role)
   - Cria profile com `role='member'` e `master_id`
   - Insere `member_permissions` para cada módulo selecionado
   - Se profile falhar → rollback (deleta auth user)

### Editar permissões

1. Master clica no ícone de editar
2. Dialog com checkboxes de módulos (pre-selecionados)
3. Server Action `updateMemberPermissions()`:
   - Verifica que target é member (não master)
   - Delete + insert das permissões (replace completo)

### Deletar member

1. Master clica no ícone de deletar
2. Dialog de confirmação
3. Server Action `deleteMember()`:
   - Verifica que target não é master
   - Deleta via `supabase.auth.admin.deleteUser()`
   - Cascade deleta profile e permissions
   - Dados criados pelo member (user_id = master) não são afetados

## Server Actions

Definidas em `src/modules/settings/actions/member.actions.ts`.

Todas usam `SUPABASE_SERVICE_ROLE_KEY` via `getAdminClient()`. Este é o **único** lugar do projeto que usa service role em Server Actions.

| Action | Permissão | Descrição |
|--------|-----------|-----------|
| `getMembers` | master | Lista todos os profiles + permissões + emails |
| `createMember` | master | Cria auth user + profile + permissions |
| `updateMemberPermissions` | master | Replace de permissões de um member |
| `deleteMember` | master | Remove auth user (cascade) |

## Schemas Zod

Definidos em `src/modules/settings/types/member.types.ts`:

- `createMemberSchema`: email, password (min 8), name, modules (min 1)
- `updateMemberPermissionsSchema`: memberId (uuid), modules (min 1)
- `memberSchema`: shape completa para listagem

## Proteções

- proxy.ts bloqueia `/settings/*` para members
- Todas as actions verificam `isMaster` antes de executar
- O master não pode deletar ou alterar a si mesmo (trigger DB)
- A UI não mostra botões de edit/delete para a row do master
