# Plan: Fix media upload — await before clearing form

## TYPE
FEATURE

## Task
Media uploads never complete because uploadMedia is called without await. The async function yields on the first blobToBase64, the form clears and the user navigates away, killing the unawaited promise chain. Fix: await uploadMedia before clearing the form.

## Approach
- Change uploadMedia call from fire-and-forget to awaited
- The "Adding..." button stays active during upload, which is correct UX — user should see the save is still in progress
- Update upload-media.ts comment to reflect it's now awaited, not fire-and-forget

## Files to Change
- `apps/thriving-mobile/src/components/CaptureFormFields.tsx` — await uploadMedia call
- `apps/thriving-mobile/src/lib/upload-media.ts` — update comment (no longer fire-and-forget)

## Scope
small (2 files)

## STATUS: COMPLETED
