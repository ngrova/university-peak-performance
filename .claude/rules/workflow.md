# Workflow

## Pre-Flight Check

Before starting any new task:

1. **Clean working tree** — Run `git status`. If there are dirty files from a previous task, either commit them in a dedicated cleanup PR or discard them. Never leave uncommitted changes in the working tree. A clean working tree is a prerequisite for starting work.
2. **Verify last PR** — Run `gh pr list --state merged --limit 1` and check its status. If the last PR failed CI or is still open, flag it to Nick before proceeding.

## Automatic Pipeline — No Slash Commands Needed

When a user describes a feature or fix in plain English, ALWAYS run this full pipeline automatically:

1. **Plan** — Create PLAN.md using the make-plan skill template (approach, files, scope, STATUS: PENDING). Present it to the user and wait for approval.
2. **Review plan** — Spawn 8 sub-agents in parallel (security, data integrity, reuse, standards, conflicts, scope, pattern consistency, test coverage). All 8 agents must approve. If any agent rejects, fix the concern and re-review. If you believe the rejection is wrong, explain the disagreement to Nick and let him decide. Never override a rejection.
3. **Approve** — Set PLAN.md STATUS: APPROVED (unlocks the require-plan hook)
4. **Build** — Write code on a feature branch (nick/ or erin/ prefix)
5. **Manager check** — Stop hook auto-runs typecheck + tests. Fix failures before proceeding.
6. **Review code** — Spawn the same 8 sub-agents on the code diff. All 8 must approve. If any reject, fix the concern and re-review. If you believe the rejection is wrong, explain the disagreement to Nick and let him decide. Never override a rejection.
7. **Ship** — Create PR with conventional commit title and what/why/how-to-test description. After creating the PR, include a direct link to the GitHub Actions CI run so Nick can monitor test progress. Use: `gh run list --limit 1 --json url --jq '.[0].url'` to get the link.
8. **Lock plan** — Immediately after creating the PR, set PLAN.md `STATUS: COMPLETED`. This prevents the stale approval from being reused as a free pass for the next task. The require-plan hook will block all code edits until a new plan is approved.
9. **CI** — Lint, typecheck, Playwright E2E, gitleaks run automatically. CI is the merge gate.
10. **Merge** — All CI green → auto-merge to main → deploys to Netlify.
11. **Human tests** — Nick or Erin tests on phone after deploy. Catches feel, polish, and UX issues that become new tasks if something is off.

The user should NEVER need to type a slash command. Just describe what you want and the system handles everything.

### Why STATUS: COMPLETED matters
The require-plan hook blocks all code edits unless PLAN.md contains `STATUS: APPROVED`. If a completed plan is left with APPROVED, the next task can bypass the planning step entirely. Always reset to COMPLETED after shipping.

## Git Workflow

- Feature branches only: `nick/short-description` or `erin/short-description`
- Never commit directly to main — all changes go through PRs
- Never force push any branch
- Conventional commit messages:
  - `feat(scope): description` — new feature
  - `fix(scope): description` — bug fix
  - `refactor(scope): description` — code restructuring
  - `docs(scope): description` — documentation
  - `test(scope): description` — tests
  - `chore(scope): description` — maintenance

## PR Descriptions

- **What** changed (1-3 bullet points)
- **Why** (the user need or bug being fixed)
- **How to test** (steps for Nick or Erin to verify on phone)

## PLAN.md Format

```
# Plan: [Feature Name]

## Task
[Plain English description from Nick or Erin]

## Approach
[How to build it]

## Files to Change
- path/to/file.tsx — what changes

## Scope
[small / medium / large]

## STATUS: PENDING
```

## E2E Testing Requirement

Every feature PR that adds or changes user-facing screens or interactions must include Playwright smoke tests covering the acceptance criteria. The Testing Agent (Agent 8) will reject PRs with missing or insufficient test coverage. Infrastructure-only changes (config, CI, docs) are exempt.

Tests live in `apps/thriving-mobile/e2e/` and verify user-facing behavior: navigate to a page, see expected content, tap buttons, type in inputs. Do not test implementation details.

## Learning from Corrections

- When Nick or Erin corrects something, append a dated one-liner to the Lessons Learned section in CLAUDE.md
- Example: `- 2026-03-17: Use Zustand selectors, not full store subscriptions`
- Lessons that repeat 3+ times get promoted to permanent rules in .claude/rules/
