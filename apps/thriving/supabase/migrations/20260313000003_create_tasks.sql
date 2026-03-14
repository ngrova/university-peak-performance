create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  notes text,
  due_date date,
  priority integer not null default 3 check (priority between 1 and 4),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  is_one_thing boolean not null default false,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "users_own_tasks" on public.tasks
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_goal_id_idx on public.tasks(goal_id);
create index tasks_parent_task_id_idx on public.tasks(parent_task_id);
