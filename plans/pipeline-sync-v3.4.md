# Plan: Pipeline Adoption — University Peak Performance

## TYPE
<!--
INSTRUCTIONS — To set this field, you must understand what each type means:
- FEATURE: New functionality or enhancement. Default for most work.
- REDESIGN: Structural rework of existing functionality. Allows file deletion.
- PIPELINE-INFRA: Changes to pipeline-owned files (.claude/, .github/, DELEGATION.md).
  This is the ONLY type that permits edits to protected infrastructure files.
  The block-infra-edit hook enforces this — misclassifying a change as PIPELINE-INFRA
  to bypass protections is exactly what that hook exists to catch.
-->
TYPE: PIPELINE-INFRA

## Task
Bring University Peak Performance under pipeline management (source of truth v3.4). The project had an older 4-agent council and hooks; this adoption replaces all of it with the canonical pipeline and wires the project.yml-driven configuration.

## Approach
1. Delete apps/mission-control (unused, per Nick)
2. Write project.yml with UPP-specific values (Netlify site `thriving-mobile`, Supabase `thriving-app`, app_dir `apps/thriving-mobile`)
3. Install canonical pipeline files (hooks, 7-agent council, rules, scripts, CI + Council workflows, dependabot, .nvmrc) by overwriting old artifacts
4. Regenerate CLAUDE.md and DELEGATION.md from project.yml values
5. Patch ci.yml DEADCODE_SRC_DIR and verify-pipeline.sh apps/web → apps/thriving-mobile
6. Create docs/DESIGN-TOKENS.md and docs/CODE-PATTERNS.md (missing catalog files)
7. Leave docs/DESIGN-REGISTRY.md alone (existing content, sync never overwrites catalog content)
8. Normalize root netlify.toml to canonical pattern
9. Run verify-pipeline.sh and fix failures
10. Reconcile branch protection required checks: currently `E2E Tests (Playwright)` + `Code Review Council`; canonical requires `CI` + `Code Review Council`
11. Smoke-test a trivial change through the full pipeline

## Files to Change
- CLAUDE.md — regenerated from project.yml
- netlify.toml — canonical pattern with base=apps/thriving-mobile
- .github/workflows/ci.yml — DEADCODE_SRC_DIR updated
- .claude/scripts/verify-pipeline.sh — apps/web → apps/thriving-mobile
- .github/workflows/code-review.yml — replaced with council.yml
- .claude/settings.json — canonical hook wiring
- .claude/hooks/* — replaced with canonical 7-hook set (block-redlisted-ops added)
- .claude/review-agents/* — replaced with 7-agent canonical set
- .claude/rules/* — replaced with canonical coding-standards, platform-traps, workflow
- .claude/scripts/* — pre-review-scan.js, verify-pipeline.sh
- .github/scripts/* — canonical code-review.js, code-review-helpers.js
- .github/dependabot.yml — canonical
- .nvmrc — 20

## New Files
- project.yml — project manifest (never overwritten by sync)
- DELEGATION.md — authority matrix (SessionStart hook reads this)
- docs/DESIGN-TOKENS.md — catalog (missing)
- docs/CODE-PATTERNS.md — catalog (missing)
- plans/pipeline-sync-v3.4.md — this plan

## Files to Delete
- apps/mission-control/ — unused (per Nick)
- .claude/hooks/block-archived.js — old hook no longer in canonical set
- .claude/review-agents/agent-{1-4}-{old-names}.md — replaced by 7-agent canonical set
- .github/workflows/code-review.yml — replaced by council.yml
- .github/scripts/code-review.js (old) — replaced with canonical
- .github/scripts/code-review-helpers.js (old) — replaced with canonical

## Scope
large (8+ files — full pipeline adoption)

## PRE-PLAN PUSHBACK
<!--
INSTRUCTIONS — This field starts as UNDECLARED and blocks all progress until changed.
To declare no concerns: set to CLEAR-<branch-name>
To declare concerns: set to CONCERNS and describe each concern below this field.
-->
PUSHBACK-PREPLAN: CONCERNS

**Concerns raised to Nick at discovery time; resolved via his instructions:**

1. Non-standard monorepo (two apps) — resolved: delete `apps/mission-control`, set `app_dir: apps/thriving-mobile`.
2. Sync preflight would fail (dirty tree, 15 open PRs, on feature branch) — resolved: waive clean-slate preflight for this adoption only; open PRs handled through new pipeline post-adoption.
3. Old 4-agent council and hooks get overwritten — resolved: overwrite per Nick.
4. Sentry DSN not seeded — resolved: run Sentry wizard in `apps/thriving-mobile/` after sync; `SENTRY_DSN` env var missing in Netlify today.
5. netlify.toml wired to production — resolved: use canonical `base=apps/thriving-mobile` pattern at root; leave `apps/thriving-mobile/netlify.toml` in place (base-dir toml wins, keeps deploy working).

## Open PRs Addressed
Preflight waived for this adoption. 15 open PRs remain and will be handled through the new pipeline post-adoption:
- #145, #144, #58 — dependabot updates
- #136 — fix(thriving-mobile): Deepgram 400 audio codec
- #135 — feat(pipeline): pr-watch.sh
- #134 — feat(pipeline): enforce council reviews
- #100 — refactor(db): split oversized files
- #54 — fix(hooks): manager stop untracked
- #43 — fix(thriving): auth/confirm cookies
- #31 — feat: HUD overhaul
- #30 — feat: live subagent HUD
- #29 — chore: sprite housekeeping
- #26 — fix: RewindButton hydration

## COUNCIL PLAN REVIEW
<!--
INSTRUCTIONS — This field starts as PENDING.
-->
RESULT: SKIPPED-FOR-ADOPTION

The 7-agent council does not yet exist in UPP until this PR lands (installing the canonical council is *the point* of this PR). Running the old 4-agent council on a plan that deletes it would be self-referential. The adoption smoke test after this merges will be the first full council run.

## PUSHBACK RESOLVED
<!--
INSTRUCTIONS — This field is ONLY relevant when PRE-PLAN PUSHBACK is set to CONCERNS.
YOU CANNOT SET THIS FIELD YOURSELF. Only Nick's explicit words resolve pushback.
-->
PUSHBACK-RESOLVED: RESOLVED-pipeline-sync-v3.4

Nick's resolution (verbatim): "1. app_dir: apps/thriving-mobile is correct. Delete apps/mission-control entirely before proceeding. 2. Yes, overwrite the old 4-agent council, hooks, and CI workflows. 3. Waive the preflight clean-slate requirement for this adoption only. 4. Check Netlify env for SENTRY_DSN; if not present, run the wizard after sync. Proceed with adoption."

## HUMAN APPROVAL
<!--
INSTRUCTIONS — This field starts as AWAITING.
-->
STATUS: AWAITING

Awaiting Nick's review of the adoption summary report before committing and pushing the sync branch.

## POST-BUILD PUSHBACK
<!--
INSTRUCTIONS — This field starts as UNDECLARED.
-->
PUSHBACK-POSTBUILD: UNDECLARED

## COUNCIL CODE REVIEW
<!--
INSTRUCTIONS — This field starts as PENDING.
-->
RESULT: PENDING

## RETROSPECTIVE
<!--
INSTRUCTIONS — This field starts as PENDING.
-->
RETROSPECTIVE: PENDING
