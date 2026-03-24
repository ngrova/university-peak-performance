create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pillar_id uuid not null references public.life_pillars(id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "users_own_goals" on public.goals
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index goals_user_id_idx on public.goals(user_id);
create index goals_pillar_id_idx on public.goals(pillar_id);
