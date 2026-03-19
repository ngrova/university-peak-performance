# Plan: E2E acceptance tests for Phase 1

## Task
"Write proper Playwright tests that perform real actions — create task, edit task, complete task — with a real Supabase session."

## Approach
- Add auth setup project that logs in via the login page and saves storageState
- Update playwright.config.ts with setup + authenticated project dependency
- Write acceptance tests: create task via capture sheet, verify it appears; tap task and edit title/notes; swipe to complete
- Tests use E2E_TEST_EMAIL and E2E_TEST_PASSWORD env vars, skip if not set
- Each test verifies the OUTCOME (task appears, title changed, task removed from queue)

## New Files
- `apps/thriving-mobile/e2e/auth.setup.ts` — logs in, saves auth state
- `apps/thriving-mobile/e2e/phase1.spec.ts` — Phase 1 acceptance tests

## Files to Change
- `apps/thriving-mobile/playwright.config.ts` — add setup project + authenticated project
- `.github/workflows/ci.yml` — add E2E_TEST_EMAIL/PASSWORD env vars

## Scope
medium (2 new, 2 changed)

## STATUS: APPROVED
