# Plan: Goal CRUD (PR 1 of 2)

## TYPE
FEATURE

## Task
Build goal management from the Goals tab — users can create, edit, move between pillars, and archive goals directly from their phones. Edit icon on GoalCard opens a detail sheet with auto-save on blur (matching TaskDetailSheet pattern). Add goal button at the bottom of PillarDetail. Delegation model must work (assistant edits use targetUserId).

## Approach
- Add `pillar_id` to `updateGoal` in `@upp/db` (column already exists on goals table) so goals can move between pillars
- Create server actions for goal CRUD using `captureException` in catch blocks (diverging from task-actions.ts silent-catch pattern)
- sort_order for new goals uses `existingGoals.length` (monotonic counter, not Date.now())
- Create a Zustand store (`use-goal-detail`) mirroring `use-task-detail` to control the GoalEditSheet
- Build GoalEditSheet (bottom sheet with auto-save): title, priority rank, target date, color, status, pillar picker
- Add edit icon to GoalCard; add "Add Goal" button (disabled during submission) at bottom of PillarDetail
- Update design registry with new components

## Files to Change
- `packages/db/goals.ts` — add `pillar_id` to updateGoal's Partial<Pick<>> type
- `apps/thriving-mobile/src/components/GoalCard.tsx` — add edit icon button (Pencil from lucide)
- `apps/thriving-mobile/src/components/PillarDetail.tsx` — add "Add Goal" button below goal list
- `apps/thriving-mobile/src/components/GoalsContent.tsx` — pass pillarId to PillarDetail, mount refresh after mutations
- `apps/thriving-mobile/src/hooks/use-goals-drilldown.ts` — expose current pillarId for goal creation
- `apps/thriving-mobile/src/app/(app)/layout.tsx` — mount GoalEditSheet alongside TaskDetailSheet
- `docs/DESIGN-REGISTRY.md` — add GoalEditSheet, AddGoalButton, update GoalCard entry

## New Files
- `apps/thriving-mobile/src/hooks/use-goal-detail.ts` — Zustand store for selected goal (mirrors use-task-detail)
- `apps/thriving-mobile/src/actions/goal-crud-actions.ts` — createGoal, updateGoalField, archiveGoal server actions
- `apps/thriving-mobile/src/components/GoalEditSheet.tsx` — bottom sheet with auto-save editing
- `apps/thriving-mobile/src/components/AddGoalButton.tsx` — inline "Add goal" with title input
- `apps/thriving-mobile/e2e/goal-crud.spec.ts` — E2E: create, edit, move, archive, delegation mode, drill-down regression, error case

## Scope
large (7 files changed, 5 new files)

## STATUS: COMPLETED
