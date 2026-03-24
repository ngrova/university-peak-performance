# Plan: Import audio + AI directive vs evidence distinction (PR 3/3)

## TYPE
FEATURE

## Task
Add Import button for audio files on capture page. Update AI prompt to distinguish user recordings (instructions that drive task fields) from imported files (evidence summarized in notes only).

## Approach
- Add `imported` flag to VoiceNote interface in Zustand store
- Add Import button to CaptureButtons (alongside Voice and Scan)
- Wire Import to file picker (accept="audio/*"), add to store with imported: true
- Update prepareMedia to pass imported flag per voice item
- Update MediaPayload type to include imported flag
- Update process-capture-action system prompt: user recordings = directives, imported = evidence
- Update buildContent to label transcripts as directive vs evidence

## Files to Change
- `apps/thriving-mobile/src/hooks/use-capture-media.ts` — add imported flag to VoiceNote
- `apps/thriving-mobile/src/components/CaptureButtons.tsx` — add Import button
- `apps/thriving-mobile/src/components/CaptureMediaSection.tsx` — wire Import, pass imported flag in prepareMedia
- `apps/thriving-mobile/src/actions/process-capture-action.ts` — update MediaPayload, prompt, buildContent

## Scope
small (4 files)

## STATUS: COMPLETED
