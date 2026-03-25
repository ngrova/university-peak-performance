# Plan: Add CORS support for claude.ai MCP connection

## TYPE
FEATURE

## Task
Claude.ai can't connect — cross-origin requests fail without CORS headers and the OPTIONS preflight returns 405.

## Approach
1. Handle OPTIONS preflight → 204 with CORS headers
2. Add CORS headers to all responses
3. Allow DELETE method for MCP session termination

## Files to Change
- `netlify/functions/fleet-sync/index.ts` — add CORS + OPTIONS handling

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
