# Plan: Fix Silent Errors + Missing Cache Invalidation on Task Field Updates

## TYPE
FEATURE

## Task
Fix two issues that together cause "reassignment doesn't work" symptoms reported by Erin:
1. `updateTaskField` in `task-actions.ts:104-105` has a silent catch block that swallows errors with no Sentry log and returns a generic message — we have zero visibility into why reassignment fails.
2. After a successful field update in `TaskDetailSheet`, no TanStack Query caches are invalidated. The Tasks tab, Today tab, and GoalDetail views keep showing the old assignee until the 60s stale time expires or the user manually reloads. Users perceive "it didn't save" even when it did.

This fix applies to ALL field edits in the task detail sheet (title, priority, assignee, failure_cost, deadline, notes, goal_id), not just assignee — every field has the same caching problem.

## Approach

### Fix 1 — `src/actions/task-actions.ts` (updateTaskField logging)

Replace the silent `catch {}` with `catch (err)`. Call `reportError(err)` so failures reach Sentry. Return the actual error message from the thrown error (typed-check: `err instanceof Error ? err.message : fallback`) so the UI surfaces the real Postgres/Supabase reason instead of a generic string.

Supabase error messages (like `"permission denied for table tasks"`, `"new row for relation \"tasks\" violates check constraint"`) are descriptive enough to diagnose the failure without leaking sensitive internal details.

### Fix 2 — `src/components/TaskDetailSheet.tsx` (cache invalidation on success)

Import `useQueryClient` from `@tanstack/react-query`. Call the hook inside `SheetBody` (hooks allowed in functional components). On successful `updateTaskField` return (no `result.error`), invalidate the task-related query keys used across the app:
- `['today-tasks']` — Today tab
- `['all-tasks']` — Tasks tab
- `['goal-tasks']` — Goal drill-down task list
- `['tree-data']` — Tree view
- `['pillars']` — pillar cards with progress
- `['goals']` — goal cards with progress

This matches the invalidation set already used by `TodayContent.tsx` handleCompleted callback and extends it with `goal-tasks` and `tree-data` so every view reflecting task data stays in sync.

Do NOT change the optimistic update pattern in `save` — the Zustand store still updates instantly, and the rollback still fires on error. The only new behavior is: after server confirms success, proactively refresh every query that might show the updated task.

### Final save function shape

```ts
const save = async (field: string, value: string | number | null) => {
  const original = task[field as keyof TaskWithContext] as string | number | null;
  updateField(field, value);  // optimistic
  const result = await updateTaskField(task.id, field, value);
  if (result.error) { updateField(field, original); return; }
  // Server confirmed — refresh all task-showing caches
  const keys = ['today-tasks', 'all-tasks', 'goal-tasks', 'tree-data', 'pillars', 'goals'];
  keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
};
```

## Files to Change
- `apps/thriving-mobile/src/actions/task-actions.ts` — fix silent catch in updateTaskField, surface real error + log to Sentry
- `apps/thriving-mobile/src/components/TaskDetailSheet.tsx` — import useQueryClient, invalidate caches on save success

## New Files
None.

## Scope
small

## Pushback
None — proceeding as specified. Root cause traced and confirmed via two investigations (2026-04-05). Nick explicitly scoped the fix to these two gaps.

## Lessons Addressed
- **Catch blocks must log error (Sentry) before returning message:** Fix 1 directly addresses this rule (explicitly violated at task-actions.ts:104).
- **Error messages actionable:** Returning the actual Supabase message gives the user + Sentry the failure reason.
- **Handle loading, success, and error states on every user-facing action:** Fix 2 ensures the "success" state propagates to all views.
- **Files ≤100 lines, functions ≤25 lines:** task-actions.ts adds ~2 code lines (67→~69). TaskDetailSheet.tsx adds ~8 lines (77→~85). Both stay well under 100. Save function grows from 6 → 10 code lines, under 25.

## Testing
- Existing Playwright E2E tests cover task-editing flows and would catch any regression in the save path.
- Manual test on phone: open task detail, change assignee from Nick to Erin, close sheet. Verify the new assignee shows immediately on the Tasks tab row and Today tab preview (no reload needed). Reopen, change it again — should persist.
- After deploy, check Sentry for any `updateTaskField` errors in Erin's next session — we should finally see WHY her reassignments have been failing.

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
