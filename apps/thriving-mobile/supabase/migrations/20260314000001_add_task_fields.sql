ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS assignee text,
  ADD COLUMN IF NOT EXISTS failure_cost text CHECK (failure_cost IN ('low', 'medium', 'high', 'critical'));

-- Update status check to include 'blocked'
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('todo', 'in_progress', 'done', 'blocked'));
