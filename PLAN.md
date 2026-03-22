# Plan: Capture Layer 3 — Voice, Camera, AI Processing (PR 2 of 2)

## TYPE
FEATURE

## Task
Add voice recording, camera capture, and AI processing to the capture sheet. Voice notes stack vertically as expandable cards. Photos scroll horizontally as thumbnails. "Process with AI" sends all content to Claude, which returns suggested task fields (title, goal, priority, assignee, deadline, notes). Media blobs stay accessible in a Zustand store until task is added — future PRs can add persistent storage without a rewrite.

## Approach
- Build `useCaptureMedia` Zustand store holding voice blobs + photo files with stable IDs — persists until cleared
- Voice recording via MediaRecorder API (audio/webm on Chrome, audio/mp4 on Safari via `isTypeSupported`)
- Pulsing animation during recording, static decorative waveform on completed cards
- Camera via native `<input type="file" accept="image/*" capture>` — opens device camera
- Resize photos client-side (max 1024px) before base64 encoding to stay within payload limits
- Configure `serverActions.bodySizeLimit: '10mb'` in next.config for multi-media payloads
- AI server action: `process.env['ANTHROPIC_API_KEY']` in 'use server' file only (never client-exposed)
- AI calls Claude (claude-haiku-4-5-20251001 for speed), returns JSON with title, goalTitle, priority, assignee, deadline, notes
- Error handling: mic denied → "Microphone access denied — check browser settings"; AI timeout → "AI processing failed — add fields manually"; payload error → "Content too large — remove a recording or photo"
- Extract `CaptureFormFields.tsx` from CaptureSheet (useCaptureForm hook, field labels, title input) to stay under 100 lines

## Files to Change
- `apps/thriving-mobile/src/components/CaptureSheet.tsx` — add media section, extract internals to CaptureFormFields
- `apps/thriving-mobile/next.config.mjs` — set serverActions.bodySizeLimit to '10mb'
- `docs/DESIGN-REGISTRY.md` — add VoiceNoteCard, PhotoCapture, CaptureMediaSection, update CaptureSheet

## New Files
- `apps/thriving-mobile/src/hooks/use-capture-media.ts` — Zustand store for voice blobs + photo files
- `apps/thriving-mobile/src/hooks/use-voice-recorder.ts` — MediaRecorder wrapper hook
- `apps/thriving-mobile/src/components/CaptureFormFields.tsx` — extracted form internals (hook, labels, title input)
- `apps/thriving-mobile/src/components/CaptureMediaSection.tsx` — voice/photo/AI buttons, cards, thumbnails
- `apps/thriving-mobile/src/components/VoiceNoteCard.tsx` — expandable card with play, waveform, transcript
- `apps/thriving-mobile/src/components/PhotoCapture.tsx` — file input + horizontal thumbnail scroll
- `apps/thriving-mobile/src/actions/process-capture-action.ts` — server action calling Claude API
- `apps/thriving-mobile/e2e/capture-ai.spec.ts` — E2E: photo capture, AI button, field population

## Scope
large (3 files changed, 8 new files)

## STATUS: APPROVED
