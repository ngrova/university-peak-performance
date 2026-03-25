# Plan: Add missing .limit() to unbounded queries in tasks-views.ts

## TYPE
FEATURE

## Task
Add .limit(200) to 3 unbounded queries in packages/db/tasks-views.ts. Addresses missing pagination from 2026-03-17 security audit. The .select('*') is intentionally kept — Supabase requires it for TypeScript type inference on join queries when generated types aren't used.

## Approach
1. Add .limit(200) to getOneThingTask
2. Add .limit(200) to getTasksWithDeadlines
3. Add .limit(200) to getTasksForQueue

## Files to Change
- `packages/db/tasks-views.ts` — add pagination limits to 3 unbounded queries

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
- 2026-03-17: "Security audit found missing .limit() pagination on all list queries" — directly fixed by adding .limit(200) to 3 unbounded queries
- 2026-03-17: ".select('*') violations" — NOT addressed here. Supabase requires * for type inference on join queries without generated types. Needs generated types to fix properly (separate task).

## COUNCIL_PLAN_REVIEW: PASS

## COUNCIL_CODE_REVIEW: PASS

## STATUS: APPROVED
