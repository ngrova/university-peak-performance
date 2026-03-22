# Plan: Add Deepgram transcription for voice recordings

## TYPE
FEATURE

## Task
Claude API cannot process audio files (document type only accepts PDFs). Add server-side transcription via Deepgram before sending to Claude. Voice recordings → Deepgram API → text transcript → Claude receives text + images for task extraction. Return transcriptions to UI so voice note cards show real transcripts.

## Approach
- Extract Deepgram helper to `lib/transcribe-audio.ts`: sends raw binary to `POST https://api.deepgram.com/v1/listen` with `Authorization: Token <key>` and `Content-Type: <mimeType>`, timeout via `AbortSignal.timeout(15000)`
- In process-capture-action.ts: transcribe all voice notes → remove audio blocks from Claude → send transcript text + images to Claude
- Return type changes to `{ suggestion: AISuggestion; transcripts: string[] } | { error: string }` so UI can display transcripts on voice cards
- `DEEPGRAM_API_KEY` read from `process.env` in 'use server' file only (never client-exposed)
- Error handling: Deepgram failure → "Transcription failed — add fields manually"

## Files to Change
- `apps/thriving-mobile/src/actions/process-capture-action.ts` — use transcribeAudio, remove audio blocks, return transcripts
- `apps/thriving-mobile/src/components/CaptureMediaSection.tsx` — handle new return type, pass transcripts to voice cards
- `apps/thriving-mobile/src/components/VoiceNoteCard.tsx` — show transcript text when available

## New Files
- `apps/thriving-mobile/src/lib/transcribe-audio.ts` — Deepgram API helper (extracted for Sandi Metz compliance)
- `apps/thriving-mobile/src/lib/transcribe-audio.test.ts` — unit tests: success, HTTP errors, timeout, malformed response

## Scope
medium (3 files changed, 2 new files)

## STATUS: COMPLETED
