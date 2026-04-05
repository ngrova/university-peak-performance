# Plan: Fix Capture Screen "Add Task" Hang

## TYPE
FEATURE

## Task
Fix the bug where the "Add Task" button on the capture screen gets stuck in "Adding…" state, forcing the user to exit and retry. Erin reported this happens multiple times per session, blocking her core capture workflow.

## Approach

Two complementary fixes — one at the failure source, one as a safety net.

### Fix 1 — `src/lib/upload-media.ts` (make uploadMedia unthrowable)

The function currently has no try/catch around `createBrowserClient()` + `supabase.auth.getUser()` on lines 30-31. If the auth call times out or errors (common on flaky mobile connections), the uncaught rejection propagates out of `uploadMedia`. The per-file loops below already have their own try/catch, so only the prefix is unprotected.

Wrap the entire function body in try/catch. Errors go to `reportError`. The function already returns `Promise<void>` and callers don't inspect the result, so swallowing errors here matches the existing contract. Per-file failures still stream to Sentry via the inner catches.

### Fix 2 — `src/components/CaptureFormFields.tsx` (guarantee saving state reset)

`handleAdd` awaits `uploadMedia` on line 53 with no try/catch. If anything in that path throws (after Fix 1 it shouldn't, but Fix 2 is defense-in-depth), `setSaving(false)` on line 54 never runs and the button stays disabled forever.

Wrap the post-`captureTask` success path in try/finally so `setSaving(false)` always runs. Move the field reset + query invalidation logic into a helper function `resetFormAndRefresh` within the hook to keep `handleAdd` under the 25-line Sandi limit.

Also surface any uploadMedia failure to the user via `setError` — right now even if uploads fail silently, the user has no indication. Keep the task save as "success" (task row was created) but add a subtle warning message in the error slot like "Task saved — attachments may have failed. Check task detail."

Actually, simpler: since uploads are genuinely best-effort (task row was created, per-file errors already reach Sentry), don't surface an error message on upload failure. The task WAS saved. Just ensure the UI resets.

### Final handleAdd shape (pseudocode)

```
async function handleAdd() {
  if (!title.trim() || saving) return false;
  setSaving(true); setError(null);
  try {
    const input = buildCaptureInput();
    const result = await captureTask(input);
    if (result.error) { setError(result.error); return false; }
    if (result.taskId) await uploadMedia(result.taskId, voiceNotes, photos, transcripts);
    resetFormAndRefresh();
    return true;
  } finally {
    setSaving(false);
  }
}
```

Two helpers extracted: `buildCaptureInput` (field assembly, lines 45-49) and `resetFormAndRefresh` (field clears + query invalidations, lines 55-64).

## Files to Change
- `apps/thriving-mobile/src/lib/upload-media.ts` — wrap body in try/catch so function never throws
- `apps/thriving-mobile/src/components/CaptureFormFields.tsx` — try/finally around save path, extract helpers to stay ≤25 lines

## New Files
None.

## Scope
small

## Pushback
None — proceeding as specified. The fix is targeted, the root cause is confirmed from code tracing (see investigation report from 2026-04-05 in conversation), and the scope is minimal.

## Lessons Addressed
- **Never guess and ship:** Bug traced to exact lines via code inspection. Three agents independently confirmed the `uploadMedia` → `auth.getUser()` → `setSaving(false)` path.
- **Handle loading/success/error states on every user-facing action:** The bug is precisely a failure to handle error state (setSaving stuck at true on error path). The fix directly addresses this rule.
- **Error messages actionable:** Reviewed — we intentionally do NOT surface per-file upload failures to the user because the task row is created and per-file errors already reach Sentry. The user sees their task in the list, which is the actionable outcome.
- **Files ≤100 lines, functions ≤25 lines:** Current handleAdd is 26 code lines (already slightly over). Refactoring extracts 2 helpers to bring handleAdd under the limit.

## Testing
- No existing Vitest test covers `useCaptureForm` — behavior is tested manually via the PWA
- Manual test on phone: capture with voice note, tap Add task, confirm button resets even if network throttled
- Playwright E2E: capture flow test (if one exists — check `apps/thriving-mobile/e2e/`)

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #186

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
