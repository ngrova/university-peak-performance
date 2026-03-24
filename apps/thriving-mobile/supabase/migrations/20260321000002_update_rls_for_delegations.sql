-- Update RLS policies on all data tables to support the delegation model.
-- Old policy: only the owner can access their own rows.
-- New policy: owner OR an assistant with a valid delegation can access the rows.
--
-- The EXISTS subquery checks the delegations table, which has its own RLS:
--   - Assistants can SELECT delegations where assistant_id = auth.uid()
--   - The subquery filters on assistant_id = auth.uid(), so RLS allows it
--
-- WITH CHECK uses the same expression as USING. This means:
--   - An assistant can INSERT rows with user_id = owner_id (delegation validates it)
--   - An assistant can INSERT rows with user_id = their own ID (auth.uid() matches)
--   - An assistant CANNOT INSERT rows with a random user_id (neither condition passes)

-- ── life_pillars ──────────────────────────────────────────
drop policy "users_own_pillars" on public.life_pillars;

create policy "users_or_delegates_pillars" on public.life_pillars
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.delegations
      where delegations.owner_id = life_pillars.user_id
      and delegations.assistant_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.delegations
      where delegations.owner_id = life_pillars.user_id
      and delegations.assistant_id = auth.uid()
    )
  );

-- ── goals ─────────────────────────────────────────────────
drop policy "users_own_goals" on public.goals;

create policy "users_or_delegates_goals" on public.goals
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.delegations
      where delegations.owner_id = goals.user_id
      and delegations.assistant_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.delegations
      where delegations.owner_id = goals.user_id
      and delegations.assistant_id = auth.uid()
    )
  );

-- ── tasks ─────────────────────────────────────────────────
drop policy "users_own_tasks" on public.tasks;

create policy "users_or_delegates_tasks" on public.tasks
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.delegations
      where delegations.owner_id = tasks.user_id
      and delegations.assistant_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.delegations
      where delegations.owner_id = tasks.user_id
      and delegations.assistant_id = auth.uid()
    )
  );
