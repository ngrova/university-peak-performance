# Plan: Use Next.js rewrite instead of Edge Function

## TYPE
FEATURE

## Task
Revert edge function approach. Use a Next.js rewrite to route /mcp to the serverless function, bypassing the catch-all. Remove edge function files, restore serverless function config.

## Files to Change
- `apps/thriving-mobile/next.config.mjs` — add rewrite /mcp → /.netlify/functions/fleet-sync
- `netlify.toml` — remove edge_functions config, restore functions config

## Files to Delete
- `netlify/edge-functions/fleet-sync.ts` — no longer needed

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
None applicable to this task.

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
