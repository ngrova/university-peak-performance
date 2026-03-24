# Plan: Capture Escape Hatch — Optional Goals + Inline Creation + AI Recommendation

## TYPE
FEATURE

## Task
Allow tasks to be captured without a goal ("unsorted"), add inline goal creation in the capture flow, and update the AI extraction to suggest new goals when no existing one fits.

## Approach

### Layer 1: Database — make goal_id nullable
- Migration: `ALTER TABLE tasks ALTER COLUMN goal_id DROP NOT NULL`
- Type: `Task.goal_id` becomes `string | null`
- Type: `CreateTaskInput.goal_id` becomes optional
- Type: `TaskWithContext.goals` becomes nullable
- `tasks-all.ts`: handle null goals in join mapping (already uses optional shapes)

### Layer 2: Server validation — remove goal requirement
- `task-actions.ts`: remove `if (!input.goal_id)` validation, handle sort_order for goalless tasks (use 0)
- `task-actions.ts`: coerce empty string goalId to null before INSERT — GoalPicker sends `''` for "No goal", server must translate to `null` for the database
- `CaptureFormFields.tsx`: remove `if (!goalId)` validation check

### Layer 3: Goal picker — "No goal" + inline creation
- `GoalPicker.tsx`: change disabled placeholder to selectable "No goal — unsorted" option; add `onNewGoal` callback prop; render "+ New Goal" button below select
- New `InlineGoalCreate.tsx`: minimal form — goal name input + pillar chip selector + Create/Cancel; calls `createGoalAction`; fires `onCreated(goalId)` callback
- `CapturePageContent.tsx`: extract AI suggestion handling into `use-ai-suggestion.ts` hook to keep under 100 lines; add state for inline form visibility; wire GoalPicker onNewGoal → show form; wire InlineGoalCreate onCreated → set goalId + refresh

### Layer 4: AI prompt — suggest new goals (rejectable suggestions)
- `process-capture-action.ts`: extract prompt string into `capture-prompt.ts` to keep under 100 lines; update prompt to say "If no existing goal fits, suggest a new goal name and set isNewGoal: true"
- `AISuggestion` type: add `isNewGoal?: boolean`
- `use-ai-suggestion.ts handleAI()`: when `isNewGoal` is true and no goal match, show InlineGoalCreate pre-filled with the suggested name — but the user can: (a) edit the suggested name, (b) dismiss and pick an existing goal from the picker, (c) skip the goal entirely. The AI suggestion is a helpful default, not a forced path. The GoalPicker remains fully functional underneath.

### Layer 5: UI indicators
- `TaskCardChips.tsx`: accept optional `hasGoal` prop; show "Unsorted" chip when false
- `TaskSwipeRow.tsx`: pass goal presence to TaskCardChips
- `one-thing-score.ts`: filter out tasks where `task.goal_id === null` before scoring (no pillar context = can't rank)

## New Files
- `supabase/migrations/[timestamp]_make_goal_id_nullable.sql` — ALTER TABLE
- `apps/thriving-mobile/src/components/InlineGoalCreate.tsx` — inline goal creation form
- `apps/thriving-mobile/src/hooks/use-ai-suggestion.ts` — extracted from CapturePageContent to keep under 100 lines
- `apps/thriving-mobile/src/lib/capture-prompt.ts` — extracted prompt builder from process-capture-action.ts

## Files to Change
- `packages/db/types.ts` — `goal_id: string | null`
- `packages/db/tasks.ts` — `CreateTaskInput.goal_id` optional
- `packages/db/tasks-views.ts` — `goals` nullable in TaskWithContext
- `packages/db/tasks-all.ts` — handle null goals in join mapping
- `apps/thriving-mobile/src/actions/task-actions.ts` — remove goal_id validation, coerce '' to null
- `apps/thriving-mobile/src/actions/process-capture-action.ts` — extract prompt, add isNewGoal
- `apps/thriving-mobile/src/components/CaptureFormFields.tsx` — remove goal validation
- `apps/thriving-mobile/src/components/GoalPicker.tsx` — no-goal option + new goal button
- `apps/thriving-mobile/src/components/CapturePageContent.tsx` — extract AI handling, wire inline creation
- `apps/thriving-mobile/src/components/TaskCardChips.tsx` — unsorted chip
- `apps/thriving-mobile/src/components/TaskSwipeRow.tsx` — pass goal presence
- `apps/thriving-mobile/src/lib/one-thing-score.ts` — exclude no-goal tasks

## Tests
- E2E: Playwright smoke test — capture a task without selecting a goal, verify it appears on Tasks tab with "Unsorted" indicator
- E2E: Playwright smoke test — use "+ New Goal" inline creation during capture, verify goal created and task filed under it
- Unit: one-thing-score.test.ts — verify tasks with null goal_id are excluded from ranking

## Scope
large (4 new, 12 modified = 16 files — all coherent to one concern: capture escape hatch)

## Council Plan Review Results

| # | Agent | Verdict |
|---|-------|---------|
| 1 | Security Audit | APPROVED |
| 2 | Data Integrity | APPROVED |
| 3 | Code Reuse & Patterns | APPROVED |
| 4 | Sandi Metz & Standards | APPROVED |
| 5 | Integration Correctness | APPROVED |
| 6 | Scope & Plan Fidelity | APPROVED |
| 7 | Pattern Consistency | APPROVED |
| 8 | Test Coverage | APPROVED |
| 9 | Silent Failure Detector | APPROVED |

COUNCIL_PLAN_REVIEW: PASS

## Council Code Review Results

| # | Agent | Verdict |
|---|-------|---------|
| 1 | Security Audit | APPROVED |
| 2 | Data Integrity | APPROVED |
| 3 | Code Reuse & Patterns | APPROVED |
| 4 | Sandi Metz & Standards | APPROVED |
| 5 | Integration Correctness | APPROVED |
| 6 | Scope & Plan Fidelity | APPROVED |
| 7 | Pattern Consistency | APPROVED |
| 8 | Test Coverage | APPROVED |
| 9 | Silent Failure Detector | APPROVED |

COUNCIL_CODE_REVIEW: PASS

## STATUS: COMPLETED
