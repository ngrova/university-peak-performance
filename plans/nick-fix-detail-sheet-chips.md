# Plan: Fix Detail Sheet Chips Not Responding to Taps

## TYPE
FEATURE

## Task
Erin reported that tapping assignee chips in the task detail sheet doesn't work — the highlight never moves. Root cause: the `useTaskDetail` Zustand store holds a static task snapshot. When `onChange` fires, the server action saves to the DB but the store never updates, so the UI never reflects the change. This affects AssigneeChips, PriorityChips, and FailureCostChips equally.

## Approach
1. Add an `updateField` method to the `useTaskDetail` Zustand store that optimistically patches a single field on the stored task
2. Update `TaskDetailSheet.tsx`'s `save` function to:
   a. Capture the original value before updating
   b. Call `updateField` immediately (optimistic) — chip highlight moves instantly
   c. Await the server action — if it returns `{ error }`, roll back the store to the original value so the UI reverts
3. No changes needed to the chip components themselves — they're correct controlled components that just need their parent to update the value prop

## Files to Change
- `apps/thriving-mobile/src/hooks/use-task-detail.ts` — add `updateField(field, value)` method to the store
- `apps/thriving-mobile/src/components/TaskDetailSheet.tsx` — update save flow with optimistic update + rollback on error (74 code lines currently, stays well under 100)

## New Files
None

## Testing
- Unit test for `useTaskDetail` store's `updateField` method — verify it patches the stored task field correctly

## Scope
small

## Pushback
None — proceeding as specified. This is a clear bug with a confirmed root cause and a minimal fix.

Note: Agent 1 flagged that the existing `updateTaskField` server action lacks an explicit auth check (it relies on RLS only). This is a pre-existing issue in all field-update paths, not introduced by this fix. Scoping it out — it warrants a separate security hardening PR.

## Lessons Addressed
- "Handle loading, success, and error states on every user-facing action" — the optimistic update provides instant success feedback; rollback + error return from `updateTaskField` handles failure with visual revert.
- "Never guess and ship" — root cause confirmed via code trace before planning the fix.

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
