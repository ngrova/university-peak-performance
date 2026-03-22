# Plan: Pillar CRUD (PR 2 of 2)

## TYPE
FEATURE

## Task
Build pillar management from the Goals tab — users can create, edit, reorder, and archive pillars directly from their phones. Edit icon on PillarCard opens a PillarEditSheet with auto-save on blur. Add Pillar button at the bottom of the pillar list. Move up/move down buttons for reorder. All delegation-aware via targetUserId.

## Approach
- Create server actions for pillar CRUD (create, update field, archive, reorder) using `reportError` in catch blocks
- sort_order for new pillars uses `existingPillars.length`; reorder swaps sort_order values between adjacent pillars
- Create Zustand store (`use-pillar-detail`) mirroring `use-goal-detail` to control PillarEditSheet
- Build PillarEditSheet (bottom sheet with auto-save): name, icon (emoji text input), color swatches, move up/down, archive
- Add edit icon to PillarCard (pencil icon opens sheet, card body still drills down) — mirrors GoalCard pattern
- Add "Add Pillar" button at bottom of PillarList — mirrors AddGoalButton pattern
- Reuse GoalColorPicker for pillar color selection
- Update design registry with new components

## Files to Change
- `apps/thriving-mobile/src/components/PillarCard.tsx` — add edit icon (Pencil), split into card body + edit button
- `apps/thriving-mobile/src/components/PillarList.tsx` — add AddPillarButton + onPillarCreated prop
- `apps/thriving-mobile/src/components/GoalsContent.tsx` — pass refresh callback to PillarList
- `apps/thriving-mobile/src/app/(app)/layout.tsx` — mount PillarEditSheet
- `docs/DESIGN-REGISTRY.md` — add PillarEditSheet, AddPillarButton, update PillarCard entry

## New Files
- `apps/thriving-mobile/src/hooks/use-pillar-detail.ts` — Zustand store for selected pillar
- `apps/thriving-mobile/src/actions/pillar-crud-actions.ts` — createPillar, updatePillarField, archivePillar, reorderPillar
- `apps/thriving-mobile/src/components/PillarEditSheet.tsx` — bottom sheet with auto-save editing + reorder
- `apps/thriving-mobile/src/components/AddPillarButton.tsx` — inline "Add pillar" with name input
- `apps/thriving-mobile/e2e/pillar-crud.spec.ts` — E2E: create, edit, reorder, archive, drill-down regression

## Scope
large (5 files changed, 5 new files)

## STATUS: APPROVED
