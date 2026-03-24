# Plan: Add confirmation to pillar archive + rename Goals tab to Pillars

## TYPE
FEATURE

## Task
Archiving a pillar has no confirmation dialog — PR #119 missed it. Add the same confirm/cancel pattern used for goal archive. Also rename the "Goals" tab label to "Pillars" since that's what the user sees first on that screen.

## Approach
- Add `confirming` state to ArchiveBtn in PillarEditSheet.tsx — first tap shows Cancel/Archive, second tap fires
- Rename "Goals" tab label to "Pillars" in BottomTabBar.tsx
- Rename page heading from "Goals" to "Pillars" in GoalsContent.tsx

## Files to Change
- `apps/thriving-mobile/src/components/PillarEditSheet.tsx` — add confirm/cancel step to ArchiveBtn
- `apps/thriving-mobile/src/components/BottomTabBar.tsx` — rename Goals → Pillars tab label
- `apps/thriving-mobile/src/components/GoalsContent.tsx` — rename page heading Goals → Pillars

## Scope
small (3 files)

## STATUS: COMPLETED
