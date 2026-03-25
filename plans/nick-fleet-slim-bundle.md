# Plan: Slim fleet-sync bundle

## TYPE
FEATURE

## Task
Remove included_files that pulls entire pnpm store (250MB+). Let esbuild bundle deps automatically, or use external_node_modules for supabase-js.

## Files to Change
- `netlify.toml` — remove included_files, keep esbuild bundler

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
