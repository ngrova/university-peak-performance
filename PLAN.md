# Plan: Fix Deepgram keyword param — use keyterm for Nova-3

## TYPE
FEATURE

## Task
Deepgram Nova-3 does not support `keywords` param. Confirmed via Netlify logs: `Deepgram API 400: Keywords are not supported for Nova-3. Please use keyterm instead.` Change `keywords` to `keyterm` in the Deepgram URL.

## Approach
- Replace `keywords=` with `keyterm=` in the Deepgram API URL in transcribe-audio.ts

## Files to Change
- `apps/thriving-mobile/src/lib/transcribe-audio.ts` — change keywords to keyterm

## Scope
small (1 file)

## STATUS: COMPLETED
