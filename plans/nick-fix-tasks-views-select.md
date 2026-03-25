# Plan: Fix .select('*') and missing .limit() in tasks-views.ts

## TYPE
FEATURE

## Task
Replace .select('*') with explicit columns and add .limit() to 3 unbounded queries in packages/db/tasks-views.ts. Addresses lessons from 2026-03-17 security audit.

## Approach
1. Replace CONTEXT_SELECT wildcard with explicit task columns + join
2. Add .limit(200) to getOneThingTask (needs all active tasks to find best one)
3. Add .limit(200) to getTasksWithDeadlines
4. Add .limit(200) to getTasksForQueue

## Files to Change
- `packages/db/tasks-views.ts` — fix wildcard select + add pagination limits

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
- 2026-03-17: "Security audit found 8x .select('*') violations in packages/db/" — directly fixed
- 2026-03-17: "Security audit found missing .limit() pagination on all list queries" — directly fixed

## COUNCIL_PLAN_REVIEW: PASS

## COUNCIL_CODE_REVIEW: PASS

## STATUS: APPROVED
