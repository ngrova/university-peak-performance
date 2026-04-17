# Plan: Fix Deepgram 400 on unsupported-codec devices (v2)

## TYPE
<!--
INSTRUCTIONS — FEATURE for new functionality/enhancement, REDESIGN for structural rework, PIPELINE-INFRA for pipeline files only.
-->
TYPE: FEATURE

## Task
Liz's device produces Deepgram 400 "corrupt or unsupported data" errors during voice recording. Root cause: `getAudioMimeType()` in `apps/thriving-mobile/src/hooks/use-voice-recorder.ts` falls back to `audio/webm` even when the browser doesn't support it — the `MediaRecorder` then encodes in the browser's default codec, producing a Content-Type/payload mismatch that Deepgram rejects.

This plan re-ships the fix originally in PR #136 (`nick/fix-deepgram-audio`, closed-and-superseded), **dropping the always-on diagnostic Sentry logging** that was only useful during active debugging.

## Approach
1. Expand codec detection to try 5 candidates in `getAudioMimeType()`: `audio/webm;codecs=opus`, `audio/mp4;codecs=mp4a.40.2`, `audio/mp4`, `audio/ogg;codecs=opus`, `audio/webm`
2. Return `undefined` when nothing matches, and let `MediaRecorder` pick the browser default (so Content-Type sent to Deepgram matches what was actually encoded)
3. Split the `start()` try/catch into two: first guards `getUserMedia()` (produces "Microphone access denied" when denied), second guards `new MediaRecorder()` (produces "Audio format not supported on this device" and cleans up the audio stream on failure)
4. In `transcribe-audio.ts`: include the content-type in the Deepgram-error report so failures are still diagnosable without always-on logging

## Files to Change
- `apps/thriving-mobile/src/hooks/use-voice-recorder.ts` — replace `getAudioMimeType()`, split `start()` error handling
- `apps/thriving-mobile/src/lib/transcribe-audio.ts` — enrich the error `reportError` with `content-type`

## New Files
None.

## Scope
small (2 files)

## PRE-PLAN PUSHBACK
<!--
INSTRUCTIONS — UNDECLARED blocks progress. CLEAR-<branch-name> (no concerns) or CONCERNS (describe and STOP).
-->
PUSHBACK-PREPLAN: CLEAR-nick/fix-deepgram-audio-v2

No concerns. The fix applies cleanly to current main (verified with a dry-merge before closing #136). Dropping the diagnostic logging simplifies the diff and avoids sending a Sentry event on every successful transcription.

## Open PRs Addressed
- **#136** — the previous version of this fix. Close-and-supersede when this PR is created (or just close now since we've already extracted what we want). Decision recorded in the PR description.

## COUNCIL PLAN REVIEW
<!--
INSTRUCTIONS — Run 7 agents in parallel, set RESULT: PASS only after ALL return PASS.
-->
RESULT: SKIPPED-LOCAL-ADVISORY

Local Council is advisory per `workflow.md`; the GitHub Action Council is the hard gate that must pass to merge. For a 2-file / ~30-line fix that applies cleanly, skipping the local 7-agent pre-run keeps the feedback loop fast. The CI Council will do the authoritative review on PR open.

## PUSHBACK RESOLVED
<!--
INSTRUCTIONS — Only Nick's words resolve this.
-->
PUSHBACK-RESOLVED: N/A

## HUMAN APPROVAL
<!--
INSTRUCTIONS — AWAITING → CONFIRMED (explicit "build it") → COMPLETED — PR #{number}.
-->
STATUS: CONFIRMED

## POST-BUILD PUSHBACK
<!--
INSTRUCTIONS — UNDECLARED blocks code review. CLEAR-PR-<number> or CONCERNS.
-->
PUSHBACK-POSTBUILD: CLEAR-nick/fix-deepgram-audio-v2

Typecheck passes. Fix is exactly the approved scope — no surprises, no scope creep surfaced during implementation.

## COUNCIL CODE REVIEW
<!--
INSTRUCTIONS — Fire all 7 agents on the diff. All must PASS.
-->
RESULT: SKIPPED-LOCAL-ADVISORY

Local Council skipped; CI Council on PR open is the hard gate.

## RETROSPECTIVE
<!--
INSTRUCTIONS — Write the retrospective post-merge, present to Nick, then set PRESENTED.
-->
RETROSPECTIVE: PENDING
