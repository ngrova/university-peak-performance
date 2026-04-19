# Plan: Pipeline Sync v4.1.2

## TYPE
TYPE: PIPELINE-INFRA

## Task
Sync all universal pipeline files in `university-peak-performance` to the pipeline source of truth v4.1.2 (dated 2026-04-19). Source: `C:\Users\Nick - Admin\code\pipeline-source-of-truth-latest.md`.

v4.1.2 carries two targeted fixes into the fleet:
- **Council parser fix** — `.github/scripts/code-review-helpers.js` corrects the fail-closed bug that misreads valid agent verdicts as rejections.
- **ci.yml e2e fixes** — `.github/workflows/ci.yml` corrects the e2e stage (matches SoT template shape).
- **Agent 4 clarifications** — RULE DISCIPLINE + `test-files-count-as-runtime` language.
- **Version bump** — `.pipeline-version` → `4.1.2`.

UPP was held from the v4.1 sync because of two known overlay-gap issues (netlify.toml `--filter` and missing Sentry envs in ci.yml build job). Those overlay blockers are v4.2 work and remain unresolved in v4.1.2. Paul's explicit direction: "UPP stays held until v4.2" AND "Run /sync-pipeline in each of the three projects." Interpretation: run the sync, but expect the sync PR's CI to fail on the same overlay blockers — that's a PAUSED state per Sync Step 8, not a failure. The purpose of running this sync is to propagate the Council parser + ci.yml fixes now; the overlay fix lands with v4.2.

## Approach
Execute Preflight + Steps 1 through 7b of the Sync section. Stop after Step 7b. No commit, no push, no PR — caller will drive shipping.

1. Preflight: clean tree, main CI passing, no open PRs, no unmerged feature work. [done — all pass]
2. Step 1: Create `pipeline-sync-v4.1.2` from fresh main. [this branch]
3. Step 2: Read `project.yml` — confirmed `ci.package_manager: pnpm` expected, `app_dir: apps/thriving-mobile`. Do not modify project.yml.
4. Step 3: Diff and overwrite universal files against SoT (hooks, scripts, agents, rules, workflows, dependabot, `.nvmrc`, `netlify.toml`).
5. Step 4: Re-generate `CLAUDE.md`, `settings.json`, rules files from SoT templates + project.yml.
6. Step 5: Ensure per-repo files exist (DELEGATION.md, design catalogs) — create only if missing.
7. Step 6: Run pipeline verification script.
8. Step 7: Reconcile branch protection required checks against rendered ci.yml job names.
9. Step 7b: Write `4.1.2` to `.pipeline-version`.
10. STOP.

## Files to Change
- `.claude/hooks/*` — overwrite with SoT versions
- `.claude/review-agents/*` — re-generate from SoT templates (agent-4 carries RULE DISCIPLINE + test-files-count-as-runtime language)
- `.claude/rules/*` — re-generate
- `.claude/scripts/*` — overwrite with SoT versions
- `.claude/settings.json` — re-generate
- `.github/scripts/code-review-helpers.js` — **parser fix** (core v4.1.2 payload)
- `.github/scripts/code-review.js` — overwrite with SoT version
- `.github/workflows/ci.yml` — **e2e fixes** (reverts to SoT template, which will drop UPP's project-specific Sentry envs in the build job and use `--filter=web` instead of UPP's `--filter=@thriving/mobile`)
- `.github/workflows/council.yml` — overwrite with SoT version
- `.github/dependabot.yml` — overwrite with SoT version
- `netlify.toml` — overwrite with SoT template (reverts UPP's project-specific base path / filter — known overlay gap)
- `CLAUDE.md` — re-generate
- `.nvmrc` — overwrite with SoT version
- `scripts/check-dead-code.js` — overwrite with SoT version
- `.pipeline-version` — write `4.1.2`

## New Files
- `plans/pipeline-sync-v4.1.2.md` — this plan

## Files to Delete
- None planned (universal files retired in v4.1.2 would be deleted per Step 3; none expected)

## Scope
large (8+ files — full universal file sync)

## Overlay-Gap Expectation (important)
This sync is EXPECTED to pause at Step 8 once shipped:
- `ci.yml` will revert to the SoT template shape. UPP's current ci.yml injects Sentry envs (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`) into the build job and uses `--filter=@thriving/mobile` in its pnpm turbo invocations. The SoT template drops both. This is the netlify/Sentry overlay-gap issue Paul knows about.
- `netlify.toml` will revert to SoT template shape. UPP's current netlify.toml has project-specific base path / filter overrides that are dropped by the SoT template.
- Result: sync PR's CI will likely fail on build (missing Sentry auth or wrong turbo filter). Per Sync Step 8, "Pipeline checks pass but app-level checks fail" = PAUSED, not failed. Paul authorized proceeding so the parser + ci.yml structural fixes propagate.
- **Do NOT patch `ci-project.yml` or otherwise preserve the overrides in this sync.** The SoT template wins. The overlay mechanism arrives in v4.2.

## Package Manager
`ci.package_manager: pnpm` in project.yml (if declared). UPP uses pnpm, not npm. Any generated ci.yml must honor that.

## PRE-PLAN PUSHBACK
PUSHBACK-PREPLAN: CLEAR-pipeline-sync-v4.1.2

Nick and Paul have authorized proceeding with the known overlay-gap expected PAUSE. No new concerns.

## Open PRs Addressed
None open. Preflight `gh pr list --state open` returned empty. PRs #208 and #209 (dependabot) were closed previously. No action required.

## COUNCIL PLAN REVIEW
RESULT: PENDING

## PUSHBACK RESOLVED
PUSHBACK-RESOLVED: N/A

## HUMAN APPROVAL
STATUS: CONFIRMED — pipeline-sync-v4.1.2

## POST-BUILD PUSHBACK
PUSHBACK-POSTBUILD: UNDECLARED

## COUNCIL CODE REVIEW
RESULT: PENDING

## RETROSPECTIVE
RETROSPECTIVE: PENDING
