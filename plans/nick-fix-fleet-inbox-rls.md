# Plan: Enable RLS on fleet_inbox table

## TYPE
FEATURE

## Task
Supabase security alert (April 7, 2026) flagged a table with RLS disabled and publicly accessible (alert code: rls_disabled_in_public). Investigation of all migrations confirms `fleet_inbox` is the only public table missing `ENABLE ROW LEVEL SECURITY`. The other three fleet tables (fleet_agents, fleet_messages, fleet_decisions) all have it. All non-fleet tables also have RLS + policies.

## Approach
1. Write a single migration that enables RLS on `fleet_inbox`
2. No policies needed — matches the existing fleet table pattern (RLS enabled, no policies = service_role bypasses, anon gets zero rows)
3. After deploy, Nick verifies by running `SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';` in Supabase SQL editor — every row should show `rowsecurity = true`

## Files to Change
- (none)

## New Files
- apps/thriving-mobile/supabase/migrations/20260408000001_enable_fleet_inbox_rls.sql — enables RLS on fleet_inbox

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
None applicable to this task.

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
