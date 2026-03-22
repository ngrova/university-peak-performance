# University of Peak Performance — Claude Code Handbook

## Critical Rules (most-violated — read these first)

- When a user describes a feature or fix, run the FULL pipeline automatically — no slash commands needed
- Always create PLAN.md with STATUS: APPROVED before writing any code
- Work on feature branches only (nick/ or erin/ prefix) — never commit to main
- Keep every file under 100 lines and every function under 25 lines
- List explicit columns in every Supabase query — never use .select('*')
- Handle loading, success, and error states on every user-facing action
- When pushing back, present the concern and wait for a response before acting. Pushback is a conversation, not a monologue — don't implement your alternative without agreement from Nick or Erin.
  <!-- Pushback = you want to change something ("this should be two PRs", "long-press is wrong, use edit icons"). Present it and WAIT.
       Relevant context = you're sharing useful info but not disagreeing. Share it and keep moving.
       Nothing to add = just proceed. Don't narrate the absence of pushback. -->

## Automatic Pipeline

When a user describes a feature or fix, ALWAYS follow this pipeline automatically:
1. Create PLAN.md (make-plan template) → present it → wait for approval
2. Run 9-agent review on the plan → revise until all 9 approve
3. Build on a feature branch (nick/ or erin/ prefix)
4. Manager stop hook runs typecheck + tests automatically
5. Run 9-agent review on the code diff → fix until all 9 approve
6. Create PR with conventional commit title
The user just describes what they want. The system handles everything.

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

## Critical Rules (repeated — read these last)

- When a user describes a feature or fix, run the FULL pipeline automatically — no slash commands needed
- Always create PLAN.md with STATUS: APPROVED before writing any code
- Work on feature branches only — never commit to main
- Keep every file under 100 lines and every function under 25 lines
- List explicit columns in every Supabase query — never use .select('*')
- Handle loading, success, and error states on every user-facing action
- When pushing back, present the concern and wait for a response before acting. Pushback is a conversation, not a monologue — don't implement your alternative without agreement from Nick or Erin.

## Lessons Learned

- 2026-03-17: Add auto-merge to pipeline — after CI passes, Claude should run `gh pr merge --auto` so Nick doesn't have to go to GitHub
- 2026-03-17: Security audit found 8x .select('*') violations in packages/db/ (tasks, goals, pillars, assessments, tree) — replace with explicit columns
- 2026-03-17: Security audit found missing .limit() pagination on all list queries — add default limit(50) per coding standards
- 2026-03-19: Never override a review agent rejection — fix the concern and re-review, or escalate to Nick for a decision
- 2026-03-19: Always reset PLAN.md to STATUS: COMPLETED after shipping a PR — stale approvals bypass the require-plan hook
- 2026-03-22: Share CI link only after the final push (including PLAN.md status update) — use `gh run list --limit 1` to get the latest run, not the one from PR creation which gets cancelled by subsequent pushes
- 2026-03-22: After creating a PR, run `gh run watch <id> --exit-status` in the background to monitor CI and report the result — don't hand Nick a link to check manually
