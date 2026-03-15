-- ============================================================
-- THRIVING — Clean Slate Migration
-- Run this in the Supabase SQL editor (project: kemmvxnmlmvspfxgfvhl)
-- This drops the old HTML prototype schema and creates the new one.
-- ============================================================

-- 1. Drop old prototype tables (cascade handles any FK deps)
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.pillars CASCADE;

-- 2. Drop old trigger/function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_default_pillars();

-- ============================================================
-- MIGRATION 1: life_pillars
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.life_pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'target',
  color text NOT NULL DEFAULT '#6366f1',
  sort_order integer NOT NULL,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.life_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_pillars" ON public.life_pillars
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX life_pillars_user_id_idx ON public.life_pillars(user_id);
CREATE INDEX life_pillars_sort_order_idx ON public.life_pillars(user_id, sort_order);

-- ============================================================
-- MIGRATION 2: goals
-- ============================================================

CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_id uuid NOT NULL REFERENCES public.life_pillars(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  sort_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_goals" ON public.goals
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX goals_user_id_idx ON public.goals(user_id);
CREATE INDEX goals_pillar_id_idx ON public.goals(pillar_id);

-- ============================================================
-- MIGRATION 3: tasks
-- ============================================================

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  parent_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  due_date date,
  priority integer NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 4),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  is_one_thing boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_tasks" ON public.tasks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX tasks_goal_id_idx ON public.tasks(goal_id);
CREATE INDEX tasks_parent_task_id_idx ON public.tasks(parent_task_id);

-- ============================================================
-- MIGRATION 4: default pillars trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_default_pillars()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.life_pillars (user_id, name, icon, color, sort_order)
  VALUES
    (NEW.id, 'Health & Fitness', '🏋️', '#ef4444', 1),
    (NEW.id, 'Career & Business', '💼', '#3b82f6', 2),
    (NEW.id, 'Family & Relationships', '👨‍👩‍👧‍👦', '#ec4899', 3),
    (NEW.id, 'Finances', '💰', '#22c55e', 4),
    (NEW.id, 'Outdoors & Adventure', '🌲', '#84cc16', 5),
    (NEW.id, 'Home & Environment', '🏠', '#f97316', 6),
    (NEW.id, 'Growth & Learning', '📚', '#8b5cf6', 7);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_pillars();

-- ============================================================
-- Done. Verify with:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- ============================================================
