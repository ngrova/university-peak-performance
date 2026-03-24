# Plan: Fix media upload — client-side Storage + browser-safe reportError

## TYPE
FEATURE

## Task
Media uploads fail silently: (1) server action payload limit rejects large base64 files, (2) reportError crashes in browser (uses process.stderr). Fix: upload files directly from browser to Supabase Storage, then call a lightweight server action to create the DB row only. Fix reportError to work in both environments.

## Approach
- Rewrite upload-media.ts to upload blobs directly to Storage using the browser client (no base64, no server action for files)
- Create a new lightweight server action createAttachmentRow that only inserts the DB row (small payload)
- Replace the old uploadAttachment server action (no longer needed for file upload)
- Fix reportError to detect browser vs server and use appropriate logging

## Files to Change
- `apps/thriving-mobile/src/lib/upload-media.ts` — upload via browser client instead of server action
- `apps/thriving-mobile/src/lib/report-error.ts` — browser-safe error reporting
- `apps/thriving-mobile/src/actions/attachment-actions.ts` — replace uploadAttachment with createAttachmentRow (DB only)

## Scope
small (3 files)

## STATUS: COMPLETED
