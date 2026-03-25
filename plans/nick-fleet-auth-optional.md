# Plan: Make Fleet Sync Auth Optional

## TYPE
FEATURE

## Task
Make Bearer token auth optional on the fleet-sync MCP server. If FLEET_API_KEY env var is set, validate it. If unset, allow unauthenticated requests. This enables claude.ai connections which only support authless or OAuth MCP servers. OAuth will be added later.

## Approach
1. Update `isAuthorized()` in auth.ts to return true when FLEET_API_KEY is empty/undefined
2. Update the header comment to reflect the new behavior
3. Update the test to cover the "no key configured" path

## Files to Change
- `netlify/functions/fleet-sync/auth.ts` — skip validation when env var unset
- `netlify/functions/fleet-sync/auth.test.ts` — add test for optional auth

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
RESULT: PENDING
