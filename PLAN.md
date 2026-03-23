# Plan: Fix Voice Note Playback Cleanup and Stale Transcripts

## TYPE
FEATURE

## Task
Two bugs: (1) Deleting a voice note doesn't stop audio playback — the HTMLAudioElement keeps playing after the card is removed from the DOM. (2) Recording a second voice note shows stale transcript text from a previous AI processing run because the transcripts array is never cleared.

## Approach
1. In VoiceNoteCard.tsx, add a `stopAndRemove` wrapper that pauses audio and resets state before calling `onRemove()`. Add a `useEffect` cleanup that pauses audio on unmount as a safety net.
2. In CaptureMediaSection.tsx, clear the `transcripts` array inside `handleVoice` after a successful recording is added — this ensures new notes never inherit stale transcript text.

## Files to Change
- apps/thriving-mobile/src/components/VoiceNoteCard.tsx — add useEffect cleanup on unmount, pause audio before remove
- apps/thriving-mobile/src/components/CaptureMediaSection.tsx — clear transcripts array when a new voice note is recorded

## Scope
small

## STATUS: APPROVED
