# Plan: Convert fleet-sync to Edge Function

## TYPE
FEATURE

## Task
The Next.js plugin's catch-all intercepts all serverless function routes. Edge Functions run BEFORE serverless functions in the request chain, completely bypassing the conflict. Create a thin edge function entry point that imports existing business logic.

## Approach
1. Create netlify/edge-functions/fleet-sync.ts — imports auth + router from existing code
2. Clean up netlify.toml — remove serverless function config, add edge function config
3. Endpoint moves to /mcp (clean URL, avoids /.netlify/functions/ namespace conflicts)

## Files to Change
- `netlify.toml` — remove functions config/redirect, add edge_functions
- `netlify/functions/fleet-sync/index.ts` — remove (no longer the entry point)

## New Files
- `netlify/edge-functions/fleet-sync.ts` — edge function entry point

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
