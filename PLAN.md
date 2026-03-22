# Plan: Fix stale data after capture — invalidate TanStack Query caches

## TYPE
FEATURE

## Task
After adding a task via capture sheet, the task list doesn't refresh. The server action calls `revalidatePath('/today')` (server-side Next.js cache) but never invalidates TanStack Query client-side caches. The existing refresh pattern (used by TaskSwipeRow, GoalDetail, etc.) calls `queryClient.invalidateQueries()` on relevant keys. Apply the same pattern to capture.

## Approach
- Add `useQueryClient` to `useCaptureForm` hook in CaptureFormFields.tsx
- After successful capture, invalidate all task-related query keys: one-thing, queue, deadlines, all-tasks, pillars, goals, goal-tasks
- Matches existing patterns in TodayContent (lines 52-55) and TasksContent (lines 43-46)

## Files to Change
- `apps/thriving-mobile/src/components/CaptureFormFields.tsx` — add query cache invalidation after successful capture

## Scope
small (1 file)

## STATUS: COMPLETED
