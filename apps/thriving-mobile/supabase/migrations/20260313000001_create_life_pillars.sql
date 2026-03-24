-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

create table public.life_pillars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'target',
  color text not null default '#6366f1',
  sort_order integer not null,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.life_pillars enable row level security;

create policy "users_own_pillars" on public.life_pillars
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index life_pillars_user_id_idx on public.life_pillars(user_id);
create index life_pillars_sort_order_idx on public.life_pillars(user_id, sort_order);
