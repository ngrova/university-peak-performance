# Plan: Task media attachments — PR 2/3: Upload + display

## TYPE
FEATURE

## Task
Wire the capture flow to upload media after task creation. Show attachments on the task detail sheet. Delete attachments with confirmation.

## Approach
- Modify captureTask to return the new task ID so the client can upload attachments
- After successful captureTask, upload voice notes + photos via uploadAttachment (best-effort, non-blocking)
- Pass Deepgram transcripts to the transcription field during upload
- Create TaskAttachments component that fetches and renders attachments on the detail sheet
- Voice notes: play button + transcript text (reuse VoiceNoteCard visual style)
- Photos: tappable thumbnails that expand to full size in a modal
- Delete button with two-tap confirmation on each attachment

## Files to Change
- `apps/thriving-mobile/src/actions/task-actions.ts` — captureTask returns { taskId?, error? }
- `apps/thriving-mobile/src/components/CaptureFormFields.tsx` — upload media after task creation
- `apps/thriving-mobile/src/components/TaskDetailSheet.tsx` — add TaskAttachments section

## New Files
- `apps/thriving-mobile/src/components/TaskAttachments.tsx` — fetches + renders attachments list
- `apps/thriving-mobile/src/components/SavedVoiceNote.tsx` — plays audio from signed URL + transcript
- `apps/thriving-mobile/src/components/SavedPhoto.tsx` — thumbnail + full-size expand modal

## Scope
medium (3 modified, 3 new = 6 files)

## STATUS: COMPLETED
