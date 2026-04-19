# Plan: Pipeline Sync v4.1.3

## TYPE
TYPE: PIPELINE-INFRA

## Task
Sync all universal pipeline files in `university-peak-performance` to the pipeline source of truth v4.1.3 (dated 2026-04-19). Source: `https://gist.githubusercontent.com/ngrova/dd706d0e8ebaaafff7d6036a3ad1f93e/raw/pipeline-source-of-truth.md`.

v4.1.3 is a point release on top of v4.1.2. Current `.pipeline-version` in this repo reads `4.1.2` — so this sync propagates any delta between 4.1.2 and 4.1.3. The SoT document has no explicit changelog; the diff is discovered empirically by comparing each universal file against its SoT version in Step 3.

UPP's known overlay gaps from v4.1.2 (ci.yml Sentry envs, netlify.toml `--filter=@thriving/mobile`) persist through v4.1.3 — no v4.2 overlay mechanism landed yet. Sync stays PIPELINE-INFRA, full stop; no app-level compensation in this PR. If CI fails on the overlay gap again at Step 8, the sync is PAUSED (same category as the v4.1.2 sync), not failed.

## Approach
Execute Preflight + Steps 1 through 7b of the Sync section. Stop after Step 7b. No commit, no push, no PR — caller will drive shipping.

1. Preflight: clean tree, main CI passing, no open PRs, no unmerged feature work. [done — all pass]
2. Step 1: Create `pipeline-sync-v4.1.3` from fresh `origin/main`. [this branch]
3. Step 2: Read `project.yml` — `app_dir: apps/thriving-mobile`, `ci.package_manager` absent (pnpm is inferred from pnpm-lock.yaml). Do not modify project.yml.
4. Step 3: Diff and overwrite universal files against SoT (hooks, scripts, review agents, GitHub workflows, helpers, dependabot, `.nvmrc`, `netlify.toml`). Delete any file retired from SoT.
5. Step 4: Re-generate `CLAUDE.md`, `settings.json`, rules files from SoT templates + project.yml values.
6. Step 5: Ensure per-repo files exist (DELEGATION.md, docs/DESIGN-*.md, docs/CODE-PATTERNS.md) — create only if missing.
7. Step 6: Run `.claude/scripts/verify-pipeline.sh` until it passes.
8. Step 7: Reconcile branch protection required checks against rendered ci.yml job names.
9. Step 7b: Write `4.1.3` to `.pipeline-version`.
10. STOP. Report to Nick and await "commit and push."

## Files to Change
- (Narrowed post-Step 3; the actual diff vs SoT v4.1.3 will be recorded here once discovered. Expected candidates: any universal file changed between v4.1.2 and v4.1.3.)

## New Files
- `plans/pipeline-sync-v4.1.3.md` — this plan

## Files to Delete
- None expected (universal files retired between 4.1.2 and 4.1.3 would be removed if the SoT dropped them)

## Scope
large (8+ files — full universal file sync; actual diff narrowed in Step 3)

## Overlay-Gap Expectation
Same posture as v4.1.2 sync:
- `ci.yml` reverts to SoT template shape. UPP's preserved Sentry envs (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`) and `--filter=@thriving/mobile` turbo flag are dropped by the template.
- `netlify.toml` reverts to SoT template shape, dropping the project-specific base path / filter.
- Result: sync PR's CI may fail on the app build. Per Sync Step 8, "Pipeline checks pass but app-level checks fail" = PAUSED, not failed. Do NOT add `ci-project.yml` overrides or otherwise patch overlays in this sync.

## Package Manager
UPP uses pnpm. Any generated ci.yml must honor the pnpm toolchain (pnpm-lock.yaml in repo root).

## PRE-PLAN PUSHBACK
PUSHBACK-PREPLAN: CLEAR-pipeline-sync-v4.1.3

Same posture and authorization as v4.1.2. Nick's direction for this sync: propagate v4.1.3 across the fleet; expect the same overlay-gap PAUSE if/when CI hits it. No new concerns.

## Open PRs Addressed
None open. Preflight `gh pr list --state open` returned `[]`. No action required.

## COUNCIL PLAN REVIEW
RESULT: PENDING

## PUSHBACK RESOLVED
PUSHBACK-RESOLVED: N/A

## HUMAN APPROVAL
STATUS: CONFIRMED — pipeline-sync-v4.1.3

## POST-BUILD PUSHBACK
PUSHBACK-POSTBUILD: UNDECLARED

## COUNCIL CODE REVIEW
RESULT: PENDING

## RETROSPECTIVE
RETROSPECTIVE: PENDING
