# Plan: Scope functions config to fleet-sync only

## TYPE
FEATURE

## Task
The wildcard [functions] config crashes the deploy by applying pnpm included_files to Next.js internal handlers. Scope to [functions."fleet-sync"].

## Files to Change
- `netlify.toml` — change [functions] to [functions."fleet-sync"]

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
