# Plan: Phase 2 — Tasks Screen (Full Task Management)

## Task
"Build the Tasks tab: searchable task list, filter chips (All/Active/Blocked/Completed), grouped by goal with collapsible sections, swipe right to complete, swipe left to delete, tap for task detail. Include Playwright E2E tests."

## Approach
- Add `getAllTasksWithContext` to @upp/db (new file tasks-all.ts) — returns all tasks for a user with goal/pillar context, with limit
- Add server action `fetchAllTasks` in tasks-page-actions.ts
- Build TasksContent client component with search bar, filter chips, and grouped list
- Reuse existing TaskRow for tap-to-detail and swipe-right-to-complete
- Add TaskSwipeRow wrapping TaskRow with swipe-left to reveal delete action
- Add TaskGoalGroup for collapsible sections grouped by goal
- Add FAB button that opens the existing capture sheet
- Write Playwright E2E tests: search finds task, filter chips work, tap opens detail, complete via detail sheet

## Files to Change
- `packages/db/index.ts` — export new getAllTasksWithContext
- `apps/thriving-mobile/src/app/(app)/tasks/page.tsx` — replace placeholder

## New Files
- `packages/db/tasks-all.ts` — getAllTasksWithContext query function
- `apps/thriving-mobile/src/actions/tasks-page-actions.ts` — fetchAllTasks server action
- `apps/thriving-mobile/src/components/TasksContent.tsx` — data fetching orchestrator
- `apps/thriving-mobile/src/components/TasksList.tsx` — filtering, grouping, and rendering
- `apps/thriving-mobile/src/components/TaskSearchBar.tsx` — sticky search input
- `apps/thriving-mobile/src/components/TaskFilterChips.tsx` — horizontal filter chip row
- `apps/thriving-mobile/src/components/TaskGoalGroup.tsx` — collapsible goal section
- `apps/thriving-mobile/src/components/TaskSwipeRow.tsx` — row with bidirectional swipe
- `apps/thriving-mobile/e2e/phase2-tasks.spec.ts` — E2E acceptance tests

## Scope
large (2 changed, 9 new — but coherent single feature)

## STATUS: APPROVED
