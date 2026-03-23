# Plan: Fix pillar list not refreshing after rename

## TYPE
FEATURE

## Task
When a pillar name is edited in PillarEditSheet, the pillar list doesn't refresh
to show the new name until you navigate away and come back. The server action
revalidates the Next.js cache but never invalidates the TanStack Query cache.

## Approach
Add an `onSaved` callback to the `usePillarDetail` Zustand store. GoalsContent
registers `drill.refresh` as the callback on mount. PillarEditSheet calls it
after every successful save (name, icon, color, reorder, archive). This keeps
queryClient access out of PillarEditSheet — pure dependency injection via Zustand.

## Files to Change
- `apps/thriving-mobile/src/hooks/use-pillar-detail.ts` — add onSaved callback to store interface and state
- `apps/thriving-mobile/src/components/PillarEditSheet.tsx` — call onSaved after successful saves in usePillarActions
- `apps/thriving-mobile/src/components/GoalsContent.tsx` — register drill.refresh as onSaved on mount

## Scope
small

## STATUS: COMPLETED
