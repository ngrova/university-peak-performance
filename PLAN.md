# Plan: One Thing Pin Button

## Task
"Add a button that lets me mark a task as my One Thing for the day. The button should appear in TaskDetailSheet. When tapped, it pins that task (sets is_one_thing=true) and unpins any previously pinned task. A visual indicator should show on TaskCard when a task is pinned as the One Thing."

## Approach
- Add partial unique index migration: enforce one is_one_thing per user at DB level
- Fix `.select('*')` and bare `.select()` in `packages/db/tasks.ts` with explicit columns
- Extract TaskDetailSheet action buttons into new `TaskDetailActions.tsx` (keeps both under 100 lines)
- Extract `StatusIcon` from TaskCard into `StatusIcon.tsx` (brings TaskCard under 100 lines)
- Add `pinOneThingAction` server action that unpins existing + pins selected task
- Add "Make My One Thing" button in TaskDetailActions with loading/error states
- Add "One Thing" star badge on TaskCard

## Files to Change
- `packages/db/tasks.ts` — replace `.select('*')` and bare `.select()` with explicit columns
- `apps/thriving/src/actions/one-thing-actions.ts` — add `pinOneThingAction`
- `apps/thriving/src/components/tasks/TaskDetailSheet.tsx` — extract actions to TaskDetailActions
- `apps/thriving/src/components/tasks/TaskCard.tsx` — extract StatusIcon, add One Thing badge

## New Files
- `apps/thriving/supabase/migrations/20260317000001_one_thing_unique.sql` — partial unique index
- `apps/thriving/src/components/tasks/TaskDetailActions.tsx` — extracted action buttons
- `apps/thriving/src/components/tasks/StatusIcon.tsx` — extracted status icon component

## Scope
small (7 files — 4 changed, 3 new)

## STATUS: APPROVED
