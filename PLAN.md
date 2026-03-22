# Plan: Strip markdown code fences from Claude JSON response

## TYPE
FEATURE

## Task
Claude wraps its JSON response in markdown code fences (```json ... ```). The JSON parser fails on the backticks. Confirmed via Netlify logs: `Non-JSON from Claude: ```json`. Strip code fences before parsing.

## Approach
- Add `text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()` before `JSON.parse` in callClaude
- One line change in process-capture-action.ts

## Files to Change
- `apps/thriving-mobile/src/actions/process-capture-action.ts` — strip code fences before JSON.parse

## Scope
small (1 file)

## STATUS: COMPLETED
