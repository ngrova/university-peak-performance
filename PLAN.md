# Plan: Fix unit test mocks after .limit() additions

## Task
"Unit tests fail because mock Supabase chains don't include .limit() — added in PR #87."

## Approach
- Add .limit() to mock chains in goals.test.ts, pillars.test.ts, assessments.test.ts
- Pattern: where mock chain ends at .order() → resolvedValue, insert .limit() returning the resolvedValue
- For getPillarsWithProgress mocks: add .limit() to goals and tasks sub-query mocks

## Files to Change
- `packages/db/goals.test.ts` — add .limit() to getGoals mock chain
- `packages/db/pillars.test.ts` — add .limit() to getPillars and getPillarsWithProgress mock chains
- `packages/db/assessments.test.ts` — add .limit() to getAssessmentHistory mock chain

## Scope
small (3 test files)

## STATUS: APPROVED
