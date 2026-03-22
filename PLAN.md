# Plan: Revert audio content block type to 'document'

## TYPE
FEATURE

## Task
Revert audio content block type from 'audio' back to 'document' in process-capture-action.ts. Netlify logs confirmed: `Input tag 'audio' found using 'type' does not match any of the expected tags`. The Claude API accepts 'document' for audio files. The improved error logging from PR #105 stays — it will capture the actual error (if any) when using 'document' type.

## Approach
- Change `type: 'audio'` back to `type: 'document'` in buildContent function
- Keep the improved error logging (full response body) from PR #105
- Deploy and test with evidence from Netlify function logs

## Files to Change
- `apps/thriving-mobile/src/actions/process-capture-action.ts` — revert audio type to 'document'

## Scope
small (1 file)

## STATUS: COMPLETED
