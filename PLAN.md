# Plan: Fix capture bug + strengthen Testing Agent

## Task
"Fix Capture sheet 'Failed to save' bug — same queryFn pattern issue. Audit all server action calls. Strengthen Agent 8's prompt to reject smoke-only tests."

## Approach
- Audit every component that calls a server action — find direct references vs arrow-wrapped calls
- Fix CaptureSheet.tsx and any other broken call sites
- Replace Agent 8 prompt with stronger action-based acceptance criteria

## Files to Change
- `apps/thriving-mobile/src/components/CaptureSheet.tsx` — check captureTask call pattern
- `apps/thriving-mobile/src/components/TaskRow.tsx` — check completeTask call
- `apps/thriving-mobile/src/components/TaskDetailSheet.tsx` — check completeTask/updateTaskField calls
- `apps/thriving-mobile/src/components/TaskActions.tsx` — check completeTask/updateTaskField calls
- `apps/thriving-mobile/src/components/GoalPicker.tsx` — check fetchGoalsForPicker call
- `.claude/skills/review-plan/SKILL.md` — replace Agent 8 prompt

## Scope
medium (6 files)

## STATUS: APPROVED
