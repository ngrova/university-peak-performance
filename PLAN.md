# Plan: Phase 1 — Today + Capture (Daily Driver)

## Task
"Build Phase 1 — Today + Capture. Open the app on my phone, see my One Thing hero card and queued tasks, capture a new task via the + button, swipe to complete a task, all data persists in Supabase."

## Approach
- Build server actions for the mobile app that call existing `@upp/db` functions (getOneThingTask, getTasksForQueue, getTasksWithDeadlines, createTask, updateTask)
- Build Today screen: greeting bar, One Thing hero card (with empty state), "Up Next" queue list, overdue/due-today section
- Build Capture bottom sheet: opens from center tab (+) button, auto-focused text input, goal picker, "Add" button, rapid capture mode (stays open after save)
- Build Task Detail bottom sheet: slides up on tap, editable title, status toggle, goal, deadline, notes — auto-saves changes
- Add swipe-to-complete gesture on queue items with optimistic UI update
- Wire the center tab (Capture) to open the bottom sheet instead of navigating to a page

## Files to Change
- `apps/thriving-mobile/src/app/(app)/today/page.tsx` — replace placeholder with real Today screen
- `apps/thriving-mobile/src/app/(app)/capture/page.tsx` — redirect to /today (capture is a sheet, not a page)
- `apps/thriving-mobile/src/components/BottomTabBar.tsx` — center tab opens capture sheet instead of navigating
- `apps/thriving-mobile/src/app/(app)/layout.tsx` — add capture sheet provider to app shell

## New Files
- `apps/thriving-mobile/src/actions/task-actions.ts` — server actions for task CRUD
- `apps/thriving-mobile/src/actions/today-actions.ts` — server actions for Today screen data
- `apps/thriving-mobile/src/components/OneThingCard.tsx` — hero card for pinned One Thing
- `apps/thriving-mobile/src/components/QueueList.tsx` — "Up Next" task list with swipe
- `apps/thriving-mobile/src/components/OverdueList.tsx` — overdue/due-today section
- `apps/thriving-mobile/src/components/TaskRow.tsx` — shared task row with swipe gesture
- `apps/thriving-mobile/src/components/CaptureSheet.tsx` — bottom sheet for quick-add
- `apps/thriving-mobile/src/components/TaskDetailSheet.tsx` — bottom sheet for task editing
- `apps/thriving-mobile/src/components/GoalPicker.tsx` — goal selector for capture
- `apps/thriving-mobile/src/components/GreetingBar.tsx` — "Good morning, Nick" with date
- `apps/thriving-mobile/src/hooks/use-capture-sheet.ts` — Zustand store for sheet open/close
- `apps/thriving-mobile/src/hooks/use-task-detail.ts` — Zustand store for task detail sheet
- `apps/thriving-mobile/src/lib/supabase-browser.ts` — browser client helper

## Scope
large (16 new files, 4 changed — but this is the core daily-driver feature)

## STATUS: APPROVED
