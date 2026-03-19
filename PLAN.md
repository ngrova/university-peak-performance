# Plan: Fix TanStack Query + server action integration

## Task
"Fix Today screen not showing tasks. TanStack Query passes AbortSignal to server actions which can't be serialized."

## Approach
- Wrap server action calls in arrow functions so TanStack Query's context (which includes non-serializable AbortSignal) isn't passed through to the server action

## Files to Change
- `apps/thriving-mobile/src/components/TodayContent.tsx` — wrap 3 queryFn calls

## Scope
small (1 file, 3 lines changed)

## STATUS: APPROVED
