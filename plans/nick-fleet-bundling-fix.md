# Plan: Fix fleet-sync function bundling

## TYPE
FEATURE

## Task
Fleet-sync Netlify function returns 404 because esbuild can't bundle it. Two issues: "type":"module" in package.json conflicts with esbuild CommonJS output, and pnpm symlinks aren't followed.

## Approach
1. Remove "type": "module" from function package.json
2. Add [functions] config to netlify.toml with esbuild bundler and pnpm included_files

## Files to Change
- `netlify/functions/fleet-sync/package.json` — remove "type": "module"
- `netlify.toml` — add [functions] section

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
