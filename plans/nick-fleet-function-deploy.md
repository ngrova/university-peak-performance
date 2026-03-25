# Plan: Fix Fleet Sync function 404

## TYPE
FEATURE

## Task
The fleet-sync Netlify function returns 404. The `@netlify/plugin-nextjs` plugin requires an explicit `functions` directory in netlify.toml to discover custom functions alongside its own generated ones.

## Approach
Add `functions = "netlify/functions"` to the `[build]` section of netlify.toml.

## Files to Change
- `netlify.toml` — add functions directory declaration

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
