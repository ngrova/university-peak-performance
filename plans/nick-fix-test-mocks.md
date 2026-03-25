# Plan: Fix test mocks for .limit() chain

## TYPE
FEATURE

## Task
Update Supabase mock query chains in tasks-views.test.ts to include .limit() method, matching the production code's new pagination calls from PR #152.

## Approach
Add .limit() to mock chains in makeOneThingClient, makeDeadlinesClient, makeQueueClient.

## Files to Change
- `packages/db/tasks-views.test.ts` — add .limit() to mock chains

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
None applicable — fixing broken tests from prior merge.

## COUNCIL_PLAN_REVIEW: PASS

## COUNCIL_CODE_REVIEW: PASS

## STATUS: APPROVED
