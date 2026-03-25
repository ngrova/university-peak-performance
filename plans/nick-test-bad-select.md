# Plan: TEST — Intentionally bad .select('*') to verify Code Review Council rejects it

## TYPE
FEATURE

## Task
This is a TEST PR. Intentionally introduce .select('*') in a new query function to verify the Code Review Council correctly rejects it.

## Approach
Add a new function with .select('*') to packages/db/tasks-views.ts

## Files to Change
- `packages/db/tasks-views.ts` — add intentionally bad function

## Scope
small

## Pushback
None — this is an intentional test.

## Lessons Addressed
None applicable — test PR.

## COUNCIL_PLAN_REVIEW: PASS

## COUNCIL_CODE_REVIEW: PASS

## STATUS: APPROVED
