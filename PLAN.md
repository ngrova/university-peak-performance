# Plan: Playwright E2E Testing Infrastructure + 8th Review Agent

## Task
"Set up Playwright for thriving-mobile with smoke tests covering Phase 0/1 acceptance criteria. Add an 8th Testing Agent to the review system. Update workflow rules to require E2E tests on every feature PR."

## Approach
- Add @playwright/test to apps/thriving-mobile, create playwright.config.ts that builds and serves the app locally before running tests (using webServer config)
- Write smoke tests: app loads, login renders, Today screen sections visible, tab bar works, capture sheet opens, task detail sheet opens
- Add e2e script to package.json, verify CI picks it up via existing `pnpm turbo e2e` workflow
- Add Agent 8 (Testing) to .claude/skills/review-plan/SKILL.md with plan-mode and code-mode checklists
- Update .claude/rules/workflow.md to require Playwright tests on feature PRs

## Files to Change
- `apps/thriving-mobile/package.json` — add e2e script (already has @playwright/test as transitive)
- `.claude/skills/review-plan/SKILL.md` — add 8th Testing Agent, update description/tables
- `.claude/rules/workflow.md` — add Playwright testing requirement
- `.github/workflows/ci.yml` — update E2E job to build mobile app and run against it

## New Files
- `apps/thriving-mobile/playwright.config.ts` — Playwright config with webServer, iPhone viewport
- `apps/thriving-mobile/e2e/smoke.spec.ts` — Phase 0 smoke tests (loads, dark bg, tab bar, no crash)
- `apps/thriving-mobile/e2e/auth.spec.ts` — Login/signup page rendering
- `apps/thriving-mobile/e2e/today.spec.ts` — Today screen sections, capture sheet, task detail

## Scope
medium (4 changed, 4 new — infrastructure/config files)

## STATUS: APPROVED
