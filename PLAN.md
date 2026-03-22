# Plan: Fix AI capture — audio content block type + error logging

## TYPE
FEATURE

## Task
Fix AI processing failure in capture sheet. Two issues: (1) audio content blocks use `type: 'document'` but Claude API likely requires `type: 'audio'` for audio files, (2) error logging only captures status code, not the response body, making diagnosis impossible.

## Approach
- Change audio content block type from 'document' to 'audio' in process-capture-action.ts
- Log full API response body on error (not just status code) for diagnosability
- Merging triggers a fresh Netlify deploy which picks up the ANTHROPIC_API_KEY env var

## Files to Change
- `apps/thriving-mobile/src/actions/process-capture-action.ts` — fix audio type + improve error logging

## Scope
small (1 file)

## STATUS: COMPLETED
