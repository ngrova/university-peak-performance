# Plan: Phase 3 — Goals + Pillars Screen

## Task
Build the Goals tab with drill-down navigation: Pillars list → Pillar detail (goals) → Goal detail (tasks). Breadcrumbs at top for back-navigation. Progress bars on pillars and goals using pillar colors. 300ms spring transitions (cubic-bezier(0.32, 0.72, 0, 1)). Reuse TaskDetailSheet and TaskSwipeRow from Phase 1/2.

## Approach
- Extract drill-down state + TanStack Query into `use-goals-drilldown.ts` hook — GoalsContent stays thin (render switch only)
- Server actions return `{ data: T } | { error: string }` — never bare `[]` on auth failure
- Build PillarCard (name, goal count, progress bar with pillar color) and GoalCard (title, task count, progress)
- Add Breadcrumbs component for "Pillars > Health > Run a marathon" navigation
- Add `getGoalsWithProgress()` and `getTasksByGoalWithContext()` to packages/db
- Fix getTasksByGoal() missing .limit(50)
- 300ms spring transition CSS between drill-down levels
- Write E2E test: Pillar → Goal → Task → detail sheet → breadcrumb back

## Files to Change
- `packages/db/goals.ts` — add getGoalsWithProgress() with task counts per goal
- `packages/db/tasks.ts` — fix getTasksByGoal() missing .limit(50); add getTasksByGoalWithContext() returning TaskWithContext[]
- `packages/db/index.ts` — export GoalWithProgress type and getTasksByGoalWithContext
- `apps/thriving-mobile/src/app/(app)/goals/page.tsx` — replace placeholder with GoalsContent

## New Files
- `apps/thriving-mobile/src/actions/goals-page-actions.ts` — 3 server actions (pillars, goals, tasks) returning { data } | { error }
- `apps/thriving-mobile/src/hooks/use-goals-drilldown.ts` — drill-down state + TanStack Query hooks (keeps GoalsContent under 100 lines)
- `apps/thriving-mobile/src/components/GoalsContent.tsx` — thin orchestrator: reads hook, renders correct level
- `apps/thriving-mobile/src/components/Breadcrumbs.tsx` — tappable breadcrumb trail
- `apps/thriving-mobile/src/components/PillarCard.tsx` — pillar card with progress bar
- `apps/thriving-mobile/src/components/PillarDetail.tsx` — goals list for one pillar
- `apps/thriving-mobile/src/components/GoalCard.tsx` — goal card with task progress
- `apps/thriving-mobile/src/components/GoalDetail.tsx` — task list for one goal, reuses TaskSwipeRow with TaskWithContext
- `apps/thriving-mobile/e2e/goals.spec.ts` — E2E: drill-down + breadcrumb navigation with assertions at every level

## Scope
large (13 files — 4 modified, 9 new)

## STATUS: COMPLETED
