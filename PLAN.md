# Plan: Clean up packages/db — limits, splits, and owner name fix

## TYPE
REDESIGN

## Task
Fix the three Sandi Metz violations Agent 3 flagged in packages/db/ (missing .limit(), file size, export count) and update the choose-account default owner name to "Nick Grover."

## Approach
- Add .limit(200) to 3 unbounded queries in tasks-views.ts (getOneThingTask, getTasksWithDeadlines, getTasksForQueue)
- Split tasks-views.ts into tasks-scoring.ts (One Thing + queue logic) and tasks-context.ts (deadline + goal-context queries)
- Split pillars.ts into pillars.ts (reads) and pillars-mutations.ts (create/update/delete)
- Update index.ts re-export paths for both splits
- Change DEFAULT_OWNER_NAME to "Nick Grover" in choose-account/page.tsx

## Files to Change
- `packages/db/tasks-views.ts` → rename to `packages/db/tasks-scoring.ts` (scoring, one-thing, queue)
- `packages/db/pillars.ts` — remove mutation functions
- `packages/db/index.ts` — update re-export paths
- `apps/thriving-mobile/src/app/(auth)/choose-account/page.tsx` — default owner name

## New Files
- `packages/db/tasks-context.ts` — deadlines + goal-context queries (split from tasks-views.ts)
- `packages/db/pillars-mutations.ts` — create, update, delete pillar (split from pillars.ts)

## Files to Delete
- `packages/db/tasks-views.ts` — replaced by tasks-scoring.ts and tasks-context.ts

## Scope
medium (7 files)

## STATUS: COMPLETED
