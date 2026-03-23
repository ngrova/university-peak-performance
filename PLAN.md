# Plan: Confirm Destructive Actions

## TYPE
FEATURE

## Task
Add confirmation dialogs to two destructive actions that currently fire immediately:
1. Archive a goal (GoalEditSheet.tsx) — fires on button tap with no confirmation
2. Delete a voice note (VoiceNoteCard.tsx) — fires on X tap with no confirmation
Voice recordings are especially critical since they can't be recreated.

## Approach
- Add a `confirming` boolean state to `ArchiveBtn` — first tap shows Cancel/Archive buttons, second tap fires the action
- Add a `confirming` boolean state to `RemoveButton` in VoiceNoteCard — first tap shows Cancel/Remove buttons, second tap fires `onRemove`
- Follow the same visual pattern as `DeleteConfirm.tsx` (danger-colored confirm button, neutral cancel button)
- Keep inline within existing components — no new files needed
- Both files stay under 100 code lines

## Files to Change
- `apps/thriving-mobile/src/components/GoalEditSheet.tsx` — add confirm/cancel step to ArchiveBtn
- `apps/thriving-mobile/src/components/VoiceNoteCard.tsx` — add confirm/cancel step to RemoveButton

## Scope
small

## STATUS: COMPLETED
