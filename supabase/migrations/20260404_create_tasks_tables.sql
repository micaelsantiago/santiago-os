-- ========================================
-- Fase 2: Tabelas do módulo de tarefas
-- ========================================

-- Boards (quadros Kanban)
create table boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  type text default 'tasks' check (type in ('tasks', 'project')),
  project_id uuid,  -- FK será adicionada quando tabela projects existir
  created_at timestamptz default now()
);

alter table boards enable row level security;
create policy "select own" on boards for select using (auth.uid() = user_id);
create policy "insert own" on boards for insert with check (auth.uid() = user_id);
create policy "update own" on boards for update using (auth.uid() = user_id);
create policy "delete own" on boards for delete using (auth.uid() = user_id);

-- Columns (colunas do board)
create table columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  position int not null,
  color text
);

alter table columns enable row level security;
create policy "select own" on columns for select using (auth.uid() = user_id);
create policy "insert own" on columns for insert with check (auth.uid() = user_id);
create policy "update own" on columns for update using (auth.uid() = user_id);
create policy "delete own" on columns for delete using (auth.uid() = user_id);

-- Tasks (tarefas)
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  column_id uuid references columns(id) on delete cascade not null,
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  status text default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  position int not null,
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;
create policy "select own" on tasks for select using (auth.uid() = user_id);
create policy "insert own" on tasks for insert with check (auth.uid() = user_id);
create policy "update own" on tasks for update using (auth.uid() = user_id);
create policy "delete own" on tasks for delete using (auth.uid() = user_id);

-- Task tags
create table task_tags (
  task_id uuid references tasks(id) on delete cascade,
  tag text not null,
  primary key (task_id, tag)
);

alter table task_tags enable row level security;
create policy "select own task_tags" on task_tags for select
  using (task_id in (select id from tasks where user_id = auth.uid()));
create policy "insert own task_tags" on task_tags for insert
  with check (task_id in (select id from tasks where user_id = auth.uid()));
create policy "delete own task_tags" on task_tags for delete
  using (task_id in (select id from tasks where user_id = auth.uid()));

-- Índices
create index on tasks (column_id);
create index on tasks (user_id, due_date) where due_date is not null;

-- Trigger updated_at
create extension if not exists moddatetime;
create trigger handle_updated_at before update on tasks
  for each row execute procedure moddatetime(updated_at);
