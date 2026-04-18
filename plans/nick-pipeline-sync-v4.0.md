# Plan: Pipeline sync to source-of-truth v4.0

## TYPE
TYPE: PIPELINE-INFRA

## Task
Sync the pipeline files in this project to the latest source of truth (v4.0). Project is currently at v3.4 (last adopted in PR #192). This sync updates hooks, review agents, rules, scripts, workflows, skills, CLAUDE.md, DELEGATION.md, and settings to match the v4.0 source of truth verbatim. project.yml is never overwritten. Per-repo catalog files (docs/DESIGN-*.md, docs/CODE-PATTERNS.md) are created only if missing.

## Approach
1. Preflight (done): clean tree, main CI green, no open PRs, branch created.
2. Read project.yml for overrides (app_dir: apps/thriving-mobile).
3. Diff and overwrite every universal file against the source of truth.
4. Re-generate project-specific templates (CLAUDE.md, settings.json, rules) using project.yml values.
5. Ensure per-repo files exist (create if missing, never overwrite).
6. Run verify-pipeline.sh until it passes.
7. Reconcile branch protection required checks (if accessible).
8. Stop at Step 8.1 per Nick's instruction — report changes, await explicit "commit and push".

## Files to Change
- .claude/settings.json — overwrite
- .claude/hooks/block-dangerous.js — overwrite
- .claude/hooks/block-infra-edit.js — overwrite
- .claude/hooks/block-on-pushback.js — overwrite
- .claude/hooks/require-plan.js — overwrite
- .claude/hooks/require-ci-pass.js — overwrite
- .claude/hooks/manager-stop.js — overwrite
- .claude/hooks/block-redlisted-ops.js — overwrite
- .claude/review-agents/shared-rules.md — overwrite
- .claude/review-agents/agent-1-security-data-integrity.md — overwrite
- .claude/review-agents/agent-2-code-quality-standards.md — overwrite
- .claude/review-agents/agent-3-integration-correctness.md — overwrite
- .claude/review-agents/agent-4-plan-fidelity.md — overwrite
- .claude/review-agents/agent-5-error-handling.md — overwrite
- .claude/review-agents/agent-6-test-coverage.md — overwrite
- .claude/review-agents/agent-7-design-consistency.md — overwrite
- .claude/rules/coding-standards.md — re-generate from template (project placeholders)
- .claude/rules/workflow.md — re-generate from template
- .claude/scripts/verify-pipeline.sh — overwrite
- .claude/scripts/pre-review-scan.js — overwrite
- .claude/skills/bootstrap/SKILL.md — overwrite (if changed)
- .claude/skills/sync-pipeline/SKILL.md — overwrite (if changed)
- .github/workflows/ci.yml — re-generate with app_dir override
- .github/workflows/council.yml — overwrite
- .github/scripts/code-review.js — overwrite
- .github/scripts/code-review-helpers.js — overwrite
- .github/dependabot.yml — overwrite
- .nvmrc — overwrite
- netlify.toml — re-generate with app_dir override
- scripts/check-dead-code.js — overwrite
- CLAUDE.md — re-generate from template with project.yml values

## New Files
- .claude/rules/platform-traps.md — check if in source of truth (may be deprecated)
- docs/DESIGN-REGISTRY.md — create if missing
- docs/DESIGN-TOKENS.md — create if missing
- docs/CODE-PATTERNS.md — create if missing
- DELEGATION.md — leave as-is if present (verify under 8k chars)

## Files to Delete
- .claude/rules/platform-traps.md — if retired in v4.0 source of truth (TBD during sync)
- Any other universal files present but removed from v4.0 source of truth

## Scope
large (30+ files)

## PRE-PLAN PUSHBACK
PUSHBACK-PREPLAN: CLEAR-nick/pipeline-sync-v4.0

## Open PRs Addressed
None open.

## COUNCIL PLAN REVIEW
RESULT: PASS — nick/pipeline-sync-v4.0

## PUSHBACK RESOLVED
PUSHBACK-RESOLVED: N/A

## HUMAN APPROVAL
STATUS: CONFIRMED — Nick explicitly invoked the sync-pipeline skill to run this work.

## POST-BUILD PUSHBACK
PUSHBACK-POSTBUILD: UNDECLARED

## COUNCIL CODE REVIEW
RESULT: PENDING

## RETROSPECTIVE
RETROSPECTIVE: PENDING
