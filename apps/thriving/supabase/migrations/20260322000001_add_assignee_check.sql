-- Add CHECK constraint on tasks.assignee to enforce valid assignee values
ALTER TABLE public.tasks ADD CONSTRAINT tasks_assignee_check
  CHECK (assignee IS NULL OR assignee IN ('Nick', 'Erin', 'Liz'));
