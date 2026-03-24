# Plan: Fix uncategorized tasks + require goal in capture

## TYPE
FEATURE

## Task
Fix two issues: (1) Tasks tab shows "Uncategorized (82)" because the join flattening in tasks-all.ts treats the PostgREST goals object as an array, dropping all goal data. (2) Make goal selection required in capture — show error if no goal selected.

## Approach
- Fix tasks-all.ts: detect whether goals is an array or object and handle both
- Fix CaptureFormFields: check goalId before calling captureTask, show error if empty
- GoalPicker already has "Select a goal" placeholder from PR #127, just need the validation

## Files to Change
- `packages/db/tasks-all.ts` — fix join flattening to handle object (not just array)
- `apps/thriving-mobile/src/components/CaptureFormFields.tsx` — validate goalId before submit

## New Files
- `packages/db/tasks-all.test.ts` — unit tests for getAllTasksWithContext: object goals, array goals, null goals

## Scope
small (3 files)

## STATUS: COMPLETED
