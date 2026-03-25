# Plan: Convert fleet-sync to Netlify Functions v1 handler

## TYPE
FEATURE

## Task
Function returns 405 for POST because esbuild compiles `export default` to CommonJS `module.exports.default`, which Netlify doesn't recognize as either v1 (`exports.handler`) or v2 (`export default`). Convert to v1 named handler export.

## Approach
Rewrite index.ts to export a named `handler` function using v1 event/response format. Thin adapter converts between v1 event and internal Request-based logic.

## Files to Change
- `netlify/functions/fleet-sync/index.ts` — convert from v2 default export to v1 named handler

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
