-- ========================================
-- Tabelas: profiles, note_folders, notes, note_tags
-- Idempotente: safe para rodar em banco onde tabelas já existem
-- ========================================

-- ----------------------------------------
-- Profiles
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  avatar_url text,
  timezone text DEFAULT 'America/Sao_Paulo',
  theme text DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'select own profile') THEN
    CREATE POLICY "select own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'update own profile') THEN
    CREATE POLICY "update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- ----------------------------------------
-- Note Folders
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS note_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES note_folders(id) ON DELETE CASCADE,
  title text NOT NULL,
  position int DEFAULT 0
);

ALTER TABLE note_folders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'note_folders' AND policyname = 'select own') THEN
    CREATE POLICY "select own" ON note_folders FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'note_folders' AND policyname = 'insert own') THEN
    CREATE POLICY "insert own" ON note_folders FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'note_folders' AND policyname = 'update own') THEN
    CREATE POLICY "update own" ON note_folders FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'note_folders' AND policyname = 'delete own') THEN
    CREATE POLICY "delete own" ON note_folders FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ----------------------------------------
-- Notes
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id uuid REFERENCES note_folders(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'Sem título',
  content text DEFAULT '',
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'select own') THEN
    CREATE POLICY "select own" ON notes FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'insert own') THEN
    CREATE POLICY "insert own" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'update own') THEN
    CREATE POLICY "update own" ON notes FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'delete own') THEN
    CREATE POLICY "delete own" ON notes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ----------------------------------------
-- Note Tags
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS note_tags (
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  tag text NOT NULL,
  PRIMARY KEY (note_id, tag)
);

ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'note_tags' AND policyname = 'select own note_tags') THEN
    CREATE POLICY "select own note_tags" ON note_tags FOR SELECT
      USING (note_id IN (SELECT id FROM notes WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'note_tags' AND policyname = 'insert own note_tags') THEN
    CREATE POLICY "insert own note_tags" ON note_tags FOR INSERT
      WITH CHECK (note_id IN (SELECT id FROM notes WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'note_tags' AND policyname = 'delete own note_tags') THEN
    CREATE POLICY "delete own note_tags" ON note_tags FOR DELETE
      USING (note_id IN (SELECT id FROM notes WHERE user_id = auth.uid()));
  END IF;
END $$;

-- ----------------------------------------
-- Índices
-- ----------------------------------------

CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_fts ON notes USING gin (to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(content, '')));

-- ----------------------------------------
-- Trigger updated_at para notes
-- ----------------------------------------

CREATE EXTENSION IF NOT EXISTS moddatetime;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at' AND tgrelid = 'notes'::regclass) THEN
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON notes
      FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);
  END IF;
END $$;
