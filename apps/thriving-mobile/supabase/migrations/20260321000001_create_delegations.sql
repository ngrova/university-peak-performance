-- Delegation table: allows an owner to grant an assistant access to their data.
-- Used by the assistant model so Erin and Liz can work within Nick's account.

create table public.delegations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  assistant_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'assistant',
  created_at timestamptz not null default now(),
  constraint delegations_unique_pair unique (owner_id, assistant_id),
  constraint delegations_no_self check (owner_id != assistant_id)
);

alter table public.delegations enable row level security;

-- Owner can manage their delegations (create, view, revoke)
create policy "owners_manage_delegations" on public.delegations
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Assistant can see which accounts have delegated to them (read-only)
create policy "assistants_read_delegations" on public.delegations
  for select
  using (auth.uid() = assistant_id);

-- Index for assistant_id lookups (account picker page, EXISTS subqueries in data table policies)
create index delegations_assistant_id_idx on public.delegations(assistant_id);
