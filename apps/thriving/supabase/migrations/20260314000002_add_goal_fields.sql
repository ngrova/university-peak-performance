ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS color text DEFAULT '#6366f1',
  ADD COLUMN IF NOT EXISTS priority_rank integer DEFAULT 5 CHECK (priority_rank BETWEEN 1 AND 10);
