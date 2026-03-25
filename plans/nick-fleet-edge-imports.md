# Plan: Add .ts extensions to all imports for Deno edge runtime

## TYPE
FEATURE

## Task
Deno requires explicit file extensions on imports. Add .ts to all relative imports in fleet-sync source files (not test files — Vitest handles those).

## Files to Change
- `netlify/functions/fleet-sync/router.ts` — 8 imports
- `netlify/functions/fleet-sync/handlers/post.ts` — 3 imports
- `netlify/functions/fleet-sync/handlers/respond.ts` — 3 imports
- `netlify/functions/fleet-sync/handlers/record-decision.ts` — 3 imports
- `netlify/functions/fleet-sync/handlers/read-decisions.ts` — 2 imports
- `netlify/functions/fleet-sync/handlers/read-post.ts` — 3 imports
- `netlify/functions/fleet-sync/handlers/sync.ts` — 4 imports
- `netlify/functions/fleet-sync/index.ts` — 2 imports

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
