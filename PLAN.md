# Plan: Capture Sheet Upgrade — Layers 1-2 (PR 1 of 2)

## TYPE
FEATURE

## Task
Upgrade the capture sheet with priority chips (P1-P4, color-coded pills), deadline picker (tappable chip → date picker), assignee picker (Nick/Erin/Liz tappable pills), and notes field. All optional — title + goal remains the only required flow. Fields clear after add for rapid-fire entry. Delegation-aware.

## Approach
- Extend `CaptureInput` in task-actions.ts to pass assignee, notes, and failure_cost through to `createTask`
- Update `TaskAssignee` type in `@upp/db` to include `'Liz'` + add DB CHECK constraint migration
- Build chip/pill sub-components: PriorityChips, DeadlineChip, AssigneeChips — reusable for PR 2
- Upgrade CaptureSheet: add scrollable content area, new fields below goal picker, preserve rapid-fire clear
- Make sheet scrollable with `max-h-[80vh] overflow-y-auto` matching GoalEditSheet pattern

## Files to Change
- `packages/db/types.ts` — add `'Liz'` to `TaskAssignee` union type
- `apps/thriving-mobile/src/actions/task-actions.ts` — extend CaptureInput with assignee, notes, failure_cost
- `apps/thriving-mobile/src/components/CaptureSheet.tsx` — add new fields, make scrollable
- `apps/thriving-mobile/src/components/GoalPicker.tsx` — show pillar name alongside goal (matches mockup)
- `docs/DESIGN-REGISTRY.md` — add PriorityChips, DeadlineChip, AssigneeChips, update CaptureSheet

## New Files
- `apps/thriving/supabase/migrations/20260322000001_add_assignee_check.sql` — CHECK constraint on assignee column
- `apps/thriving-mobile/src/components/PriorityChips.tsx` — P1-P4 color-coded pill selector
- `apps/thriving-mobile/src/components/DeadlineChip.tsx` — tappable chip wrapping native date input
- `apps/thriving-mobile/src/components/AssigneeChips.tsx` — Nick/Erin/Liz tappable pill selector
- `apps/thriving-mobile/e2e/capture-upgrade.spec.ts` — E2E: add with all fields, quick capture, clear after add

## Scope
medium (5 files changed, 5 new files)

## STATUS: COMPLETED
