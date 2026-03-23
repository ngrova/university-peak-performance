# Plan: Add goal picker + fix title wrapping on task detail sheet

## TYPE
FEATURE

## Task
Two issues on the task detail sheet: (1) goal is read-only text instead of an editable picker — user can't change which goal a task belongs to, (2) task titles clip in the input instead of wrapping. Fix both: replace GoalLabel with GoalPicker (auto-save on change), replace title input with auto-sizing textarea for wrapping.

## Approach
- Replace read-only GoalLabel with GoalPicker component (same one from capture), auto-save goal_id on change
- Replace title `<input>` with `<textarea>` that auto-sizes to content height for full text wrapping
- Remove the unused GoalLabel private function

## Files to Change
- `apps/thriving-mobile/src/components/TaskDetailSheet.tsx` — add GoalPicker, replace title input with textarea
- `apps/thriving-mobile/src/components/GoalPicker.tsx` — update CALLED BY header to include TaskDetailSheet

## Scope
small (2 files changed)

## STATUS: COMPLETED
