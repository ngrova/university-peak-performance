# University Peak Performance — Thriving Mobile Handbook

## Critical Rules (most-violated — read these first)

- When a user describes a feature or fix, run the FULL pipeline automatically — no slash commands needed
- Always create plans/{branch}.md — human must confirm "build it" before writing any code
- Work on feature branches only (nick/ prefix) — never commit to main
- Keep every file under 100 lines and every function under 25 lines
- List explicit columns in every Supabase query — never use .select('*')
- Handle loading, success, and error states on every user-facing action

## Automatic Pipeline

20-step pipeline in 3 phases. See `.claude/rules/workflow.md` for the full detailed flow.

**Phase A (Before Code):** Pre-flight checks → pre-plan pushback declaration → create branch → write plan → Council plan review → present to human → human confirms "build it"
**Phase B (Writing Code):** Build (hooks enforce safety) → post-build pushback declaration → Council code review (local, advisory)
**Phase C (Ship):** Create PR → monitor CI → Council code review (CI, hard gate) → CI (hard gate) → auto-merge → lock plan → deploy monitoring → post-PR retrospective → present feedback to human

The local code review is advisory. The authoritative code review runs in GitHub Actions — an independent process Claude Code cannot skip, forge, or influence.

## Delegation

Read `DELEGATION.md` at repo root for your authority matrix — what you can do independently, what requires Nick's approval, and what is off-limits. The SessionStart hook injects this file into every session automatically, but reference it when making decisions about external services.

## Bug Fix Protocol

When a bug is reported, follow this sequence. Do not skip steps.

1. **Reproduce** — Confirm the bug exists. Get the exact error message, log output, or user-reported behavior.
2. **Diagnose** — Read the actual error. Check logs, not assumptions. If you can't access logs, ask Nick to check and report back. Never guess at the cause.
3. **Confirm the root cause** — State what is broken and why, with evidence. "The Claude API returns 400 because type 'audio' is not a valid content block type" is evidence. "It's probably the audio type" is a guess.
4. **Write the fix** — Targeted to the confirmed cause. One fix for one confirmed problem.
5. **Run the full pipeline** — Bug fixes go through the Council review like everything else. No exceptions.
6. **Verify** — After deploy, confirm the fix resolved the issue with the same evidence method from step 1 (logs, reproduction, user confirmation). A fix is not done until it's verified.

Never guess and ship. The cost of one round trip to check the logs is always less than the cost of a wrong fix that creates a second bug or masks the real cause. If you find yourself saying "the most likely cause is..." — stop. That's a guess. Get the evidence.

## Branch and Commit Rules

- Feature branches: `nick/short-description`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- PR descriptions include what changed, why, and how to test
- Never force push any branch

## Stack

- Next.js 14+ (App Router, TypeScript strict)
- Turborepo monorepo (deployable app at `apps/thriving-mobile/`)
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, RLS)
- Netlify (auto-deploy from `main`)
- Sentry (error tracking)
- Stripe (test mode at bootstrap)
- Anthropic Claude API
- Deepgram (speech-to-text)
- Progressive Web App (mobile-first — installable, offline-capable)

The active deployable application is `apps/thriving-mobile/`. All application code lives there. Shared config, db, ui, and utility code lives in `packages/`.

## Project Structure

This is a Turborepo monorepo. The deployable Next.js app lives at `apps/thriving-mobile/`. Shared packages live at `packages/`. Pipeline files (`.claude/`, `.github/`, `CLAUDE.md`, `DELEGATION.md`) live at the repo root.

- `apps/thriving-mobile/` — Next.js App Router application (deployable)
- `apps/_archived-thriving-desktop/` — archived, excluded from workspace
- `packages/` — shared config, db, ui, utils
- `fleet-sync-server/` — auxiliary server (outside pipeline scope)
- `.claude/` — Claude Code hooks, rules, review agents, scripts
- `.github/` — CI workflows, Council review action, Dependabot config
- `docs/` — design tokens, registry, code patterns (catalog)
- `plans/` — per-branch plan files (committed to the branch)
- `apps/thriving-mobile/supabase/` — migrations and local config

- Build with `turbo run build` (not `pnpm build` directly)
- Netlify deploys from `apps/thriving-mobile/` (configured in `netlify.toml`)
- See `.claude/rules/coding-standards.md` for Sandi Metz rules and resilience rules
- See `.claude/rules/workflow.md` for task lifecycle and git workflow

## Coding Principles

- Before building any UI element, read the three catalog files: `docs/DESIGN-TOKENS.md`, `docs/DESIGN-REGISTRY.md`, and `docs/CODE-PATTERNS.md`
- Never hardcode a color, shadow, radius, or spacing value that has a named token — use the token
- When building a UI component, find the matching pattern in the design registry and copy its exact className string
- If introducing a new UI pattern, register it in DESIGN-REGISTRY.md in the same PR
- When updating shared components, update the design registry as part of the same PR
- One component per file, every function gets a one-line comment
- Validate inputs at the database level (CHECK, NOT NULL, UNIQUE, RLS)
- Paginate all queries (default 50 rows) — never fetch unbounded result sets
- Config values come from environment variables — never hardcode secrets
- Use try/catch with actionable error messages ("Failed to save — try again")
- Disable submit buttons on click to prevent double-submission
- Wrap every route in a React error boundary reporting to Sentry

## Pipeline Feedback Loop

- After every merged PR, present a structured retrospective to the human (Steps 18–20 of the workflow)
- The manager-stop hook enforces this — session cannot end without presenting the retrospective
- The human routes actionable findings to Paul (the pipeline architect)
- Never modify hooks, delete permanent rules, or weaken review checks

## Pushback Enforcement

Two mandatory declarations per PR — both enforced by hooks.

**Pre-Plan Pushback (step 3):** Before planning begins, you MUST declare whether you have concerns about the requested approach. The `PUSHBACK-PREPLAN` field in the plan template starts as `UNDECLARED` — this blocks all progress. Change it to `CLEAR-{branch-name}` (no concerns) or `CONCERNS` (concerns exist — describe them and STOP). The hook verifies the branch suffix matches the current branch. A previous branch's clearance does not carry forward.

**Post-Build Pushback (step 9):** After building all code, you MUST declare whether concerns surfaced during implementation. The `PUSHBACK-POSTBUILD` field starts as `UNDECLARED` — this blocks the code review. Change it to `CLEAR-PR-{number}` (no concerns) or `CONCERNS` (concerns exist — describe them and STOP).

**When to declare CONCERNS:** Different approach needed, risk found, decision needed, disagree with instructions, scope creep discovered during build.
**When NOT to:** Just sharing context (no actual concern), ready to proceed, minor observations.

## REDESIGN PRs

REDESIGN PRs are first-class citizens in this pipeline.
They must shrink or modernize the codebase, not grow it.
The Council adapts automatically based on TYPE
but never relaxes FEATURE safety.

- Set TYPE: REDESIGN when the primary intent is replacing, consolidating, or removing existing code
- REDESIGN unlocks the "Files to Delete" section — every deletion must list a reason
- Agents 2, 3, and 4 apply conditional rules for intentional deletions
- Use FEATURE (the default) for all new functionality

## PIPELINE-INFRA PRs

Use TYPE: PIPELINE-INFRA for changes to hooks, wrappers, settings, rules, and review agents. The `block-infra-edit` hook blocks all edits to `.claude/hooks/`, `.claude/settings.json`, `.claude/rules/`, `.claude/pipeline/`, and `.claude/skills/` unless the plan has TYPE: PIPELINE-INFRA and human approval. Infrastructure changes require extra scrutiny.

## Sub-Agent Pipeline Rule

When delegating work to sub-agents (parallel worktrees), the full pipeline is non-negotiable:
- Every sub-agent must run the Council plan review before building code
- Every sub-agent must run the Council code review before creating a PR
- If sub-agents cannot run the Council themselves, the main session must run both reviews on each agent's work before the PR is created
- No exceptions — parallel execution does not justify skipping reviews
- A sub-agent that ships a PR without Council review has violated the pipeline, same as if the main session skipped it

## Parallel Instances

When Nick runs two Claude Code instances on this repo simultaneously, they MUST use separate git worktrees to avoid branch-switching conflicts.

- Primary workspace: C:\Users\Nick - Admin\code\university-peak-performance (this directory)
- Parallel workspace: C:\Users\Nick - Admin\code\university-peak-performance-parallel

Nick launches the parallel workspace by running `parallel` (or double-clicking parallel.bat) from the primary workspace. This opens a new terminal in the worktree directory where he types `claude` to start a second instance.

IMPORTANT: Two worktrees cannot have the same branch checked out. Each instance must create its own feature branch with its own plan file. Each instance must independently complete the full 20-step pipeline — including Council plan review, Council code review, and post-PR retrospective — before creating a PR.

If the parallel workspace doesn't exist, parallel.bat creates it automatically.

## CI Merge Gate

The `require-ci-pass` hook mechanically blocks `gh pr merge` unless all CI checks are passing.
- `gh pr merge --auto` is always allowed — GitHub gates CI itself
- `gh pr merge` or `gh pr merge --admin` without `--auto` is blocked until `gh pr checks` shows all SUCCESS
- If CI status can't be queried, the merge is blocked (fail closed)
- The "Code Review Council" GitHub Action check must also pass — this is the independent trust boundary
- Always monitor CI after pushing — do not attempt to merge until you have confirmed all checks pass

## Critical Rules (repeated — read these last)

- When a user describes a feature or fix, run the FULL pipeline automatically — no slash commands needed
- Always create plans/{branch}.md — human must confirm "build it" before writing any code
- Work on feature branches only — never commit to main
- Keep every file under 100 lines and every function under 25 lines
- List explicit columns in every Supabase query — never use .select('*')
- Handle loading, success, and error states on every user-facing action
- Pushback declarations are mandatory — UNDECLARED blocks progress
