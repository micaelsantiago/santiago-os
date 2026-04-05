-- ========================================
-- RBAC: roles master + member
-- Idempotente: safe para banco existente
-- ========================================

-- ----------------------------------------
-- 1. Alterar profiles: adicionar role e master_id
-- ----------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'member'
      CHECK (role IN ('master', 'member'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'master_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN master_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Backfill: primeiro user existente vira master
UPDATE profiles SET role = 'master', master_id = NULL
WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1)
  AND role != 'master';

-- ----------------------------------------
-- 2. Trigger: primeiro user inserido é master
-- ----------------------------------------

CREATE OR REPLACE FUNCTION set_first_user_as_master()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'master') THEN
    NEW.role := 'master';
    NEW.master_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_first_user_master ON profiles;
CREATE TRIGGER trg_set_first_user_master
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_first_user_as_master();

-- ----------------------------------------
-- 3. Trigger: proteger master (imutável)
-- ----------------------------------------

CREATE OR REPLACE FUNCTION protect_master_role()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.role = 'master' THEN
    RAISE EXCEPTION 'Cannot delete master account';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.role = 'master' AND NEW.role != 'master' THEN
    RAISE EXCEPTION 'Cannot change master role';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_master ON profiles;
CREATE TRIGGER trg_protect_master
  BEFORE UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_master_role();

-- ----------------------------------------
-- 4. Tabela member_permissions
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS member_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module text NOT NULL CHECK (module IN ('tasks', 'calendar', 'projects', 'notes', 'email', 'agent')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(member_id, module)
);

ALTER TABLE member_permissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'member_permissions' AND policyname = 'master manages permissions') THEN
    CREATE POLICY "master manages permissions" ON member_permissions FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'member_permissions' AND policyname = 'member reads own permissions') THEN
    CREATE POLICY "member reads own permissions" ON member_permissions FOR SELECT
      USING (auth.uid() = member_id);
  END IF;
END $$;

-- ----------------------------------------
-- 5. Função helper RLS: owner ou member autorizado
-- ----------------------------------------

CREATE OR REPLACE FUNCTION is_owner_or_authorized_member(row_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Owner direto (master vê os próprios dados)
  IF auth.uid() = row_user_id THEN
    RETURN true;
  END IF;
  -- Member: verifica se o row pertence ao meu master
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'member'
      AND master_id = row_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ----------------------------------------
-- 6. Substituir RLS policies nas tabelas de dados
-- ----------------------------------------

-- === boards ===
DROP POLICY IF EXISTS "select own" ON boards;
DROP POLICY IF EXISTS "insert own" ON boards;
DROP POLICY IF EXISTS "update own" ON boards;
DROP POLICY IF EXISTS "delete own" ON boards;
DROP POLICY IF EXISTS "select own or master" ON boards;
DROP POLICY IF EXISTS "insert own or as member" ON boards;
DROP POLICY IF EXISTS "update own or as member" ON boards;
DROP POLICY IF EXISTS "delete own only" ON boards;

CREATE POLICY "select own or master" ON boards FOR SELECT
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "insert own or as member" ON boards FOR INSERT
  WITH CHECK (is_owner_or_authorized_member(user_id));
CREATE POLICY "update own or as member" ON boards FOR UPDATE
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "delete own only" ON boards FOR DELETE
  USING (auth.uid() = user_id);

-- === columns ===
DROP POLICY IF EXISTS "select own" ON columns;
DROP POLICY IF EXISTS "insert own" ON columns;
DROP POLICY IF EXISTS "update own" ON columns;
DROP POLICY IF EXISTS "delete own" ON columns;
DROP POLICY IF EXISTS "select own or master" ON columns;
DROP POLICY IF EXISTS "insert own or as member" ON columns;
DROP POLICY IF EXISTS "update own or as member" ON columns;
DROP POLICY IF EXISTS "delete own only" ON columns;

CREATE POLICY "select own or master" ON columns FOR SELECT
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "insert own or as member" ON columns FOR INSERT
  WITH CHECK (is_owner_or_authorized_member(user_id));
CREATE POLICY "update own or as member" ON columns FOR UPDATE
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "delete own only" ON columns FOR DELETE
  USING (auth.uid() = user_id);

-- === tasks ===
DROP POLICY IF EXISTS "select own" ON tasks;
DROP POLICY IF EXISTS "insert own" ON tasks;
DROP POLICY IF EXISTS "update own" ON tasks;
DROP POLICY IF EXISTS "delete own" ON tasks;
DROP POLICY IF EXISTS "select own or master" ON tasks;
DROP POLICY IF EXISTS "insert own or as member" ON tasks;
DROP POLICY IF EXISTS "update own or as member" ON tasks;
DROP POLICY IF EXISTS "delete own only" ON tasks;

CREATE POLICY "select own or master" ON tasks FOR SELECT
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "insert own or as member" ON tasks FOR INSERT
  WITH CHECK (is_owner_or_authorized_member(user_id));
CREATE POLICY "update own or as member" ON tasks FOR UPDATE
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "delete own only" ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- === task_tags ===
DROP POLICY IF EXISTS "select own task_tags" ON task_tags;
DROP POLICY IF EXISTS "insert own task_tags" ON task_tags;
DROP POLICY IF EXISTS "delete own task_tags" ON task_tags;
DROP POLICY IF EXISTS "select task_tags authorized" ON task_tags;
DROP POLICY IF EXISTS "insert task_tags authorized" ON task_tags;
DROP POLICY IF EXISTS "delete task_tags owner only" ON task_tags;

CREATE POLICY "select task_tags authorized" ON task_tags FOR SELECT
  USING (task_id IN (
    SELECT id FROM tasks WHERE is_owner_or_authorized_member(user_id)
  ));
CREATE POLICY "insert task_tags authorized" ON task_tags FOR INSERT
  WITH CHECK (task_id IN (
    SELECT id FROM tasks WHERE is_owner_or_authorized_member(user_id)
  ));
CREATE POLICY "delete task_tags owner only" ON task_tags FOR DELETE
  USING (task_id IN (
    SELECT id FROM tasks WHERE auth.uid() = user_id
  ));

-- === note_folders ===
DROP POLICY IF EXISTS "select own" ON note_folders;
DROP POLICY IF EXISTS "insert own" ON note_folders;
DROP POLICY IF EXISTS "update own" ON note_folders;
DROP POLICY IF EXISTS "delete own" ON note_folders;
DROP POLICY IF EXISTS "select own or master" ON note_folders;
DROP POLICY IF EXISTS "insert own or as member" ON note_folders;
DROP POLICY IF EXISTS "update own or as member" ON note_folders;
DROP POLICY IF EXISTS "delete own only" ON note_folders;

CREATE POLICY "select own or master" ON note_folders FOR SELECT
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "insert own or as member" ON note_folders FOR INSERT
  WITH CHECK (is_owner_or_authorized_member(user_id));
CREATE POLICY "update own or as member" ON note_folders FOR UPDATE
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "delete own only" ON note_folders FOR DELETE
  USING (auth.uid() = user_id);

-- === notes ===
DROP POLICY IF EXISTS "select own" ON notes;
DROP POLICY IF EXISTS "insert own" ON notes;
DROP POLICY IF EXISTS "update own" ON notes;
DROP POLICY IF EXISTS "delete own" ON notes;
DROP POLICY IF EXISTS "select own or master" ON notes;
DROP POLICY IF EXISTS "insert own or as member" ON notes;
DROP POLICY IF EXISTS "update own or as member" ON notes;
DROP POLICY IF EXISTS "delete own only" ON notes;

CREATE POLICY "select own or master" ON notes FOR SELECT
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "insert own or as member" ON notes FOR INSERT
  WITH CHECK (is_owner_or_authorized_member(user_id));
CREATE POLICY "update own or as member" ON notes FOR UPDATE
  USING (is_owner_or_authorized_member(user_id));
CREATE POLICY "delete own only" ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- === note_tags ===
DROP POLICY IF EXISTS "select own note_tags" ON note_tags;
DROP POLICY IF EXISTS "insert own note_tags" ON note_tags;
DROP POLICY IF EXISTS "delete own note_tags" ON note_tags;
DROP POLICY IF EXISTS "select note_tags authorized" ON note_tags;
DROP POLICY IF EXISTS "insert note_tags authorized" ON note_tags;
DROP POLICY IF EXISTS "delete note_tags owner only" ON note_tags;

CREATE POLICY "select note_tags authorized" ON note_tags FOR SELECT
  USING (note_id IN (
    SELECT id FROM notes WHERE is_owner_or_authorized_member(user_id)
  ));
CREATE POLICY "insert note_tags authorized" ON note_tags FOR INSERT
  WITH CHECK (note_id IN (
    SELECT id FROM notes WHERE is_owner_or_authorized_member(user_id)
  ));
CREATE POLICY "delete note_tags owner only" ON note_tags FOR DELETE
  USING (note_id IN (
    SELECT id FROM notes WHERE auth.uid() = user_id
  ));

-- ----------------------------------------
-- 7. Atualizar RLS de profiles
-- ----------------------------------------

DROP POLICY IF EXISTS "select own profile" ON profiles;
DROP POLICY IF EXISTS "update own profile" ON profiles;
DROP POLICY IF EXISTS "select own or master profile" ON profiles;

CREATE POLICY "select own or master profile" ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR id = (SELECT master_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "update own profile" ON profiles FOR UPDATE
  USING (auth.uid() = id);
