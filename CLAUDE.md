# University of Peak Performance — Claude Code Handbook

## Critical Rules (most-violated — read these first)

- When a user describes a feature or fix, run the FULL pipeline automatically — no slash commands needed
- Always create plans/{branch}.md with STATUS: APPROVED before writing any code
- Work on feature branches only (nick/ or erin/ prefix) — never commit to main
- Keep every file under 100 lines and every function under 25 lines
- List explicit columns in every Supabase query — never use .select('*')
- Handle loading, success, and error states on every user-facing action

## Automatic Pipeline

When a user describes a feature or fix, ALWAYS follow this pipeline automatically:
1. Create plans/{branch}.md (make-plan template) → present it → wait for approval
2. Run 9-agent review on the plan → revise until all 9 approve
3. Build on a feature branch (nick/ or erin/ prefix)
4. Manager stop hook runs typecheck + tests automatically
5. Run 9-agent review on the code diff → fix until all 9 approve
6. Create PR with conventional commit title
The user just describes what they want. The system handles everything.

## Bug Fix Protocol

When a bug is reported, follow this sequence. Do not skip steps.

1. **Reproduce** — Confirm the bug exists. Get the exact error message, log output, or user-reported behavior.
2. **Diagnose** — Read the actual error. Check logs, not assumptions. If you can't access logs, ask Nick to check and report back. Never guess at the cause.
3. **Confirm the root cause** — State what is broken and why, with evidence. "The Claude API returns 400 because type 'audio' is not a valid content block type" is evidence. "It's probably the audio type" is a guess.
4. **Write the fix** — Targeted to the confirmed cause. One fix for one confirmed problem.
5. **Run the full pipeline** — Bug fixes go through the 9-agent review like everything else. No exceptions.
6. **Verify** — After deploy, confirm the fix resolved the issue with the same evidence method from step 1 (logs, reproduction, user confirmation). A fix is not done until it's verified.

Never guess and ship. The cost of one round trip to check the logs is always less than the cost of a wrong fix that creates a second bug or masks the real cause. If you find yourself saying "the most likely cause is..." — stop. That's a guess. Get the evidence.

## Branch and Commit Rules

- Feature branches: `nick/short-description` or `erin/short-description`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- PR descriptions include what changed, why, and how to test
- Never force push any branch

## Stack

- **Framework:** Next.js App Router (Server Components by default, 'use client' only when needed)
- **Language:** TypeScript strict — no `any`
- **Styling:** Tailwind CSS + shadcn/ui — no custom CSS files
- **Database:** Supabase (PostgreSQL + RLS on every table)
- **Client state:** Zustand (granular selectors only)
- **Server state:** TanStack Query
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Hosting:** Netlify (auto-deploys from main)

## Monorepo Structure

```
apps/thriving/          Commercial SaaS — task management with Life Pillars
apps/mission-control/   Internal dashboard
docs/                   Architecture docs, decisions log, specs
```

- Supabase project ID: kemmvxnmlmvspfxgfvhl
- See `.claude/rules/coding-standards.md` for Sandi Metz rules and resilience rules
- See `.claude/rules/workflow.md` for task lifecycle and git workflow

## Coding Principles

- Before building any UI component, check `docs/DESIGN-REGISTRY.md` for the canonical implementation — use it, don't build a new version unless the plan explicitly replaces it
- When updating shared components, update the design registry as part of the same PR
- One component per file, every function gets a one-line comment
- Validate inputs at the database level (CHECK, NOT NULL, UNIQUE, RLS)
- Paginate all queries (default 50 rows) — never fetch unbounded result sets
- Config values come from environment variables — never hardcode secrets
- Use try/catch with actionable error messages ("Failed to save — try again")
- Disable submit buttons on click to prevent double-submission
- Wrap every route in a React error boundary reporting to Sentry

## Self-Improvement

- When corrected, append a dated one-liner to Lessons Learned below
- When the buffer hits 10: promote 3x-repeated lessons to .claude/rules/, archive oldest unrepeated to .claude/CHANGELOG.md
- Never modify hooks, delete permanent rules, or weaken review checks

## REDESIGN PRs

REDESIGN PRs are first-class citizens in this pipeline.
They must shrink or modernize the codebase, not grow it.
The 9-agent council adapts automatically based on TYPE
but never relaxes FEATURE safety.

- Set TYPE: REDESIGN when the primary intent is replacing, consolidating, or removing existing code
- REDESIGN unlocks the "Files to Delete" section — every deletion must list a reason
- Agents 3, 6, and 8 apply conditional rules for intentional deletions
- Use FEATURE (the default) for all new functionality

## Sub-Agent Pipeline Rule

When delegating work to sub-agents (parallel worktrees), the full pipeline is non-negotiable:
- Every sub-agent must run the 9-agent plan review before building code
- Every sub-agent must run the 9-agent code review before creating a PR
- If sub-agents cannot run the council themselves, the main session must run both reviews on each agent's work before the PR is created
- No exceptions — parallel execution does not justify skipping reviews
- A sub-agent that ships a PR without 9-agent review has violated the pipeline, same as if the main session skipped it

## Post-PR Rule

After creating a PR, run `bash scripts/pr-watch.sh <PR_NUMBER>`. Do not tell Nick to test until this script completes successfully. No exceptions, no manual alternatives.

## Critical Rules (repeated — read these last)

- When a user describes a feature or fix, run the FULL pipeline automatically — no slash commands needed
- Always create plans/{branch}.md with STATUS: APPROVED before writing any code
- Work on feature branches only — never commit to main
- Keep every file under 100 lines and every function under 25 lines
- List explicit columns in every Supabase query — never use .select('*')
- Handle loading, success, and error states on every user-facing action

## Lessons Learned

- 2026-03-17: Add auto-merge to pipeline — after CI passes, Claude should run `gh pr merge --auto` so Nick doesn't have to go to GitHub
- 2026-03-17: Security audit found 8x .select('*') violations in packages/db/ (tasks, goals, pillars, assessments, tree) — replace with explicit columns
- 2026-03-17: Security audit found missing .limit() pagination on all list queries — add default limit(50) per coding standards
- 2026-03-19: Never override a review agent rejection — fix the concern and re-review, or escalate to Nick for a decision
- 2026-03-19: Always reset plan file to STATUS: COMPLETED after shipping a PR — stale approvals bypass the require-plan hook
- 2026-03-22: Never skip the 9-agent review, even for small fixes. The pipeline is non-negotiable — if a fix is too small for the council, it's still not too small for the council.
- 2026-03-23: Sub-agents in parallel worktrees bypassed the 9-agent review on PRs #127-129. Promoted to permanent rule: Sub-Agent Pipeline Rule.
