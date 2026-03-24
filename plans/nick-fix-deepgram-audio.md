# Plan: Fix Deepgram rejecting audio from certain devices

## TYPE
FEATURE

## Task
Fix Deepgram 400 "corrupt or unsupported data" from Liz's device. Root cause: `getAudioMimeType()` falls back to `audio/webm` when the browser doesn't support webm or basic mp4, causing a Content-Type mismatch. Add MIME type logging to Sentry for future diagnosis.

## Approach
- Fix `getAudioMimeType()` to try more codecs (mp4+aac, ogg+opus) and fall back to creating MediaRecorder without a mimeType option so the browser picks its default
- Catch MediaRecorder constructor errors separately from microphone errors — report the actual problem, not "Microphone access denied"
- Add Sentry breadcrumb in `transcribeAudio()` logging the Content-Type sent to Deepgram — invisible failures become visible
- Include Content-Type in the Deepgram error report so we can diagnose from Sentry

## Files to Change
- `apps/thriving-mobile/src/hooks/use-voice-recorder.ts` — expand codec detection, graceful fallback, separate error handling
- `apps/thriving-mobile/src/lib/transcribe-audio.ts` — add Sentry breadcrumb for MIME type, include content type in error report

## Scope
small (0 new, 2 modified = 2 files)

## Council Plan Review Results

| # | Agent | Verdict |
|---|-------|---------|
| 1 | Security Audit | APPROVED |
| 2 | Data Integrity | APPROVED |
| 3 | Code Reuse & Patterns | APPROVED |
| 4 | Sandi Metz & Standards | APPROVED |
| 5 | Integration Correctness | APPROVED |
| 6 | Scope & Plan Fidelity | APPROVED |
| 7 | Pattern Consistency | APPROVED |
| 8 | Test Coverage | APPROVED |
| 9 | Silent Failure Detector | APPROVED |

COUNCIL_PLAN_REVIEW: PASS

## Council Code Review Results

| # | Agent | Verdict |
|---|-------|---------|
| 1 | Security Audit | APPROVED |
| 2 | Data Integrity | APPROVED |
| 3 | Code Reuse & Patterns | APPROVED |
| 4 | Sandi Metz & Standards | APPROVED |
| 5 | Integration Correctness | APPROVED |
| 6 | Scope & Plan Fidelity | APPROVED |
| 7 | Pattern Consistency | APPROVED |
| 8 | Test Coverage | APPROVED |
| 9 | Silent Failure Detector | APPROVED |

COUNCIL_CODE_REVIEW: PASS

## STATUS: COMPLETED
