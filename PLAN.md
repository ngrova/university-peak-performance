# Plan: Assistant Delegation Model

## TYPE
FEATURE

## Task
Let Erin and Liz log in with their own accounts and work within Nick's data — seeing his pillars, goals, and tasks as if they were their own. Regular users who sign up in the future are completely unaffected. Split into two PRs: database layer first, then application layer.

## Approach

### PR 1 — Database Layer (nick/delegation-db)
- Create `delegations` table with RLS (owner manages, assistant reads)
- Update RLS on life_pillars, goals, tasks to allow access when a valid delegation exists
- Extend test-rls.ts with 6 delegation scenarios (table must exist before tests can set up data)

### PR 2 — Application Layer (nick/delegation-app)
- Create `getActingAsUserId()` helper: reads `acting_as` cookie, validates against delegations table, returns owner's user_id or falls back to auth.uid()
- Update 8 server action functions that pass `user.id` to db queries — swap to `targetUserId`
- Leave 5 functions unchanged (completeTask, updateTaskField, deleteTaskAction, fetchGoalsForPillar, fetchTasksForGoal) — they operate by entity ID and RLS handles permission
- Build `/choose-account` page under (auth) route group (no tab bar) — queries delegations on mount, redirects to /today if none exist, otherwise shows picker
- Change login/signup redirects from `/today` to `/choose-account`
- Add DelegationBanner to app layout — reads `acting_as` cookie server-side, renders "Viewing Nick's account" bar when active
- Create seed-delegations script (looks up Erin + Liz by email, inserts delegation rows to Nick)

### RLS Policy Design (PR 1)
**delegations table — two policies:**
- `owners_manage_delegations` FOR ALL: `USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id)`
- `assistants_read_delegations` FOR SELECT: `USING (auth.uid() = assistant_id)`

**Data tables (pillars, goals, tasks) — drop old policy, create new:**
- USING: `auth.uid() = user_id OR EXISTS (SELECT 1 FROM delegations WHERE owner_id = [table].user_id AND assistant_id = auth.uid())`
- WITH CHECK: same expression — allows assistant to INSERT rows with owner's user_id, blocks rows with wrong user_id
- Add index on `delegations(assistant_id)` for subquery performance

## Files to Change

### PR 1 (3 files — small)
- `apps/thriving/supabase/migrations/20260321000001_create_delegations.sql` — new table + RLS + index
- `apps/thriving/supabase/migrations/20260321000002_update_rls_for_delegations.sql` — drop/create policies on 3 data tables
- `apps/thriving/scripts/test-rls.ts` — add 6 delegation test scenarios

### PR 2 (14 files — large)
- `apps/thriving-mobile/src/lib/get-acting-as.ts` — new helper
- `apps/thriving-mobile/src/actions/today-actions.ts` — targetUserId in 3 functions
- `apps/thriving-mobile/src/actions/task-actions.ts` — targetUserId in captureTask
- `apps/thriving-mobile/src/actions/goal-actions.ts` — targetUserId in fetchGoalsForPicker
- `apps/thriving-mobile/src/actions/goals-page-actions.ts` — targetUserId in fetchPillars
- `apps/thriving-mobile/src/actions/tasks-page-actions.ts` — targetUserId in fetchAllTasks
- `apps/thriving-mobile/src/actions/tree-actions.ts` — targetUserId in fetchTreeData
- `apps/thriving-mobile/src/app/(auth)/choose-account/page.tsx` — new account picker
- `apps/thriving-mobile/src/components/DelegationBanner.tsx` — new banner component
- `apps/thriving-mobile/src/app/(app)/layout.tsx` — add DelegationBanner
- `apps/thriving-mobile/src/app/(auth)/login/page.tsx` — redirect to /choose-account
- `apps/thriving-mobile/src/app/(auth)/signup/page.tsx` — redirect to /choose-account
- `apps/thriving/scripts/seed-delegations.ts` — new script
- `docs/DESIGN-REGISTRY.md` — add DelegationBanner entry

## Not in Scope
- Assessments table (no migration exists, not in mobile app)
- GreetingBar changes (doesn't show a name — just "Good morning" + date)
- Assignee field changes (stays as text label)
- Invite flow, permissions, audit trail, team/workspace concepts

## Scope
large (17 files across 2 PRs: 3 in PR 1, 14 in PR 2)

## STATUS: COMPLETED
