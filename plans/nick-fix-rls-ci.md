# Plan: Fix RLS CI Test Failure

## TYPE
FEATURE

## Task
Copy RLS test scripts and supabase config from archived desktop app to thriving-mobile so CI RLS tests pass.

## Approach
1. Copy `scripts/test-rls.ts`, `scripts/test-rls-helpers.ts`, `scripts/test-rls-delegation.ts` to `apps/thriving-mobile/scripts/`
2. Copy `supabase/config.toml` and migrations to `apps/thriving-mobile/supabase/`
3. Update config.toml project_id from "thriving" to "thriving-mobile"

## Files to Change
- None modified

## New Files
- `apps/thriving-mobile/scripts/test-rls.ts`
- `apps/thriving-mobile/scripts/test-rls-helpers.ts`
- `apps/thriving-mobile/scripts/test-rls-delegation.ts`
- `apps/thriving-mobile/supabase/config.toml`
- `apps/thriving-mobile/supabase/migrations/` (all migration files)

## Scope
small

## Pushback
None — proceeding as specified.

## COUNCIL_CODE_REVIEW: PASS

## STATUS: APPROVED
