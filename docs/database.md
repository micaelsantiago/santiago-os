# Database

Schema do PostgreSQL, RLS, migrations e como trabalhar com o banco de dados.

---

## Diagrama de Tabelas

```
auth.users (Supabase Auth)
    │
    ├── profiles (1:1)           ← role, master_id
    │
    ├── boards (1:N)
    │   └── columns (1:N)
    │       └── tasks (1:N)
    │           └── task_tags (1:N)
    │
    ├── note_folders (1:N)       ← self-referencial (parent_id)
    │   └── notes (1:N)
    │       └── note_tags (1:N)
    │
    └── member_permissions (1:N) ← módulos permitidos por member
```

## Tabelas

### profiles

Estende `auth.users` com dados do app. PK é o `id` do auth user.

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid (PK, FK → auth.users) | — | ID do usuário |
| name | text | null | Nome de exibição |
| avatar_url | text | null | URL do avatar |
| timezone | text | 'America/Sao_Paulo' | Fuso horário |
| theme | text | 'system' | Tema (light/dark/system) |
| role | text | 'member' | 'master' ou 'member' |
| master_id | uuid (FK → auth.users) | null | ID do master (null se é master) |
| created_at | timestamptz | now() | Criação |

### boards

Quadros Kanban. Cada usuário tem pelo menos um board de tipo 'tasks'.

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid (PK) | gen_random_uuid() | — |
| user_id | uuid (FK) | not null | Dono |
| title | text | not null | Nome do board |
| type | text | 'tasks' | 'tasks' ou 'project' |
| project_id | uuid | null | FK futura para projects |
| created_at | timestamptz | now() | Criação |

### columns

Colunas do Kanban, ordenadas por `position`.

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid (PK) | gen_random_uuid() | — |
| board_id | uuid (FK → boards) | not null | Board pai |
| user_id | uuid (FK) | not null | Dono |
| title | text | not null | Nome da coluna |
| position | int | not null | Ordem |
| color | text | null | Cor (hex) |

### tasks

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid (PK) | gen_random_uuid() | — |
| user_id | uuid (FK) | not null | Dono |
| column_id | uuid (FK → columns) | not null | Coluna do Kanban |
| title | text | not null | Título |
| description | text | null | Descrição Markdown |
| priority | text | 'medium' | low, medium, high |
| status | text | 'open' | open, in_progress, done, cancelled |
| position | int | not null | Ordem na coluna |
| due_date | timestamptz | null | Prazo |
| created_at | timestamptz | now() | Criação |
| updated_at | timestamptz | now() | Atualização (trigger automático) |

### notes

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid (PK) | gen_random_uuid() | — |
| user_id | uuid (FK) | not null | Dono |
| folder_id | uuid (FK → note_folders) | null | Pasta (null = raiz) |
| title | text | 'Sem título' | Título |
| content | text | '' | Conteúdo HTML (sanitizado) |
| is_pinned | boolean | false | Fixada no topo |
| created_at | timestamptz | now() | Criação |
| updated_at | timestamptz | now() | Atualização (trigger automático) |

### member_permissions

Tabela de allowlist: se existe uma row `(member_id, module)`, o member tem acesso.

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| id | uuid (PK) | gen_random_uuid() | — |
| member_id | uuid (FK → auth.users) | not null | Member |
| module | text | not null | tasks, calendar, projects, notes, email, agent |
| created_at | timestamptz | now() | Criação |

Constraint: `UNIQUE(member_id, module)`

---

## Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. O padrão é:

### Tabelas de dados (boards, columns, tasks, notes, note_folders)

```sql
-- Função reutilizável: owner OU member autorizado do master
CREATE FUNCTION is_owner_or_authorized_member(row_user_id uuid) RETURNS boolean AS $$
BEGIN
  IF auth.uid() = row_user_id THEN RETURN true; END IF;
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'member' AND master_id = row_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- SELECT, INSERT, UPDATE: owner ou member
CREATE POLICY "select own or master" ON tabela FOR SELECT
  USING (is_owner_or_authorized_member(user_id));

-- DELETE: apenas owner direto (master)
CREATE POLICY "delete own only" ON tabela FOR DELETE
  USING (auth.uid() = user_id);
```

### Junction tables (task_tags, note_tags)

Verificam ownership via tabela pai:

```sql
CREATE POLICY "select task_tags authorized" ON task_tags FOR SELECT
  USING (task_id IN (SELECT id FROM tasks WHERE is_owner_or_authorized_member(user_id)));
```

### profiles

- SELECT: próprio perfil OU perfil do master
- UPDATE: apenas próprio perfil
- DELETE/INSERT: controlado por triggers

### member_permissions

- ALL para master
- SELECT próprio para member

---

## Triggers

### updated_at automático

Aplicado em `tasks` e `notes` via extensão `moddatetime`:

```sql
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
```

### Proteção do master

```sql
-- Primeiro user inserido vira master automaticamente
CREATE TRIGGER trg_set_first_user_master BEFORE INSERT ON profiles ...

-- Impede alterar role ou deletar master
CREATE TRIGGER trg_protect_master BEFORE UPDATE OR DELETE ON profiles ...
```

---

## Migrations

Ficam em `supabase/migrations/` com nomenclatura `YYYYMMDD_descricao.sql`.

| Arquivo | Conteúdo |
|---------|----------|
| `20260404_create_tasks_tables.sql` | boards, columns, tasks, task_tags + RLS |
| `20260405_create_notes_profiles_tables.sql` | profiles, note_folders, notes, note_tags + RLS |
| `20260406_add_rbac.sql` | role/master_id em profiles, member_permissions, nova RLS |

### Convenções

- Todas idempotentes (`CREATE TABLE IF NOT EXISTS`, `DO $$ IF NOT EXISTS ...`)
- Ordem importa: tabelas referenciadas antes das que referenciam
- RLS policies com guard `IF NOT EXISTS` dentro de blocos `DO $$`
- Índices com `IF NOT EXISTS`

### Como criar uma nova migration

1. Criar arquivo em `supabase/migrations/YYYYMMDD_descricao.sql`
2. Escrever DDL idempotente
3. Adicionar RLS policies seguindo o padrão existente
4. Rodar `supabase db push` para aplicar
5. Regenerar tipos: `supabase gen types typescript --local > src/lib/supabase/database.types.ts`

---

## Índices

```sql
-- Tasks: queries mais comuns
CREATE INDEX ON tasks (column_id);
CREATE INDEX ON tasks (user_id, due_date) WHERE due_date IS NOT NULL;

-- Notes: listagem e busca full-text
CREATE INDEX ON notes (user_id, updated_at DESC);
CREATE INDEX ON notes USING gin (to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(content, '')));
```

---

Próximo: [Autenticação & RBAC](./auth.md)
