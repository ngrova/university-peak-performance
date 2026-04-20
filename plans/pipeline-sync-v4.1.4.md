# Plan: Pipeline sync to source-of-truth v4.1.4

## TYPE
<!--
INSTRUCTIONS — To set this field, you must understand what each type means:
- FEATURE: New runtime code or enhancement. Default for most work.
- REDESIGN: Structural rework of existing runtime code. Allows file deletion.
- PIPELINE-INFRA: Changes to pipeline-owned files (.claude/, .github/, DELEGATION.md).
  This is the ONLY type that permits edits to protected infrastructure files.
  The block-infra-edit hook enforces this — misclassifying a change as PIPELINE-INFRA
  to bypass protections is exactly what that hook exists to catch.
- DOCS: Documentation-only changes. Diff touches only *.md files.
  Short-circuits runtime-specific Council checks. Still reviewed for secrets,
  plan fidelity, and TYPE-vs-scope consistency.
Set this field based on what the work actually is. Misclassification (e.g.,
setting DOCS when the diff includes runtime code) is caught by Agent 4's
TYPE-vs-scope check. Do not change it later without re-running the Council
plan review from scratch.
-->
TYPE: PIPELINE-INFRA

## Task
Sync this project's pipeline-owned files to the authoritative source-of-truth document at version 4.1.4. Scope is pipeline-file-only per the Sync section — no app-level changes, no dependency bumps, no runtime code touched.

## Approach
Drift analysis in Step 1 identified three universal files that diverged from SoT v4.1.4 after template rendering (project.yml placeholders + `app_dir` substitution). Overwrite those three files verbatim from the rendered SoT content. Write `.pipeline-version` to `4.1.4`. Reconcile branch-protection required-check contexts if any drift exists. Run `verify-pipeline.sh` before shipping.

All other universal files (hooks, workflows, review agents, scripts, rules, core config) were verified byte-identical to the rendered SoT — no action needed.

## Files to Change
- `.claude/hooks/block-dangerous.js` — SoT adds `refuseBash()` helper and `stripHeredocs()` helper; every block now emits a hook-layer-refusal prefix, and heredoc bodies are stripped before pattern matching so retro prose mentioning blocked commands no longer self-blocks
- `.claude/hooks/require-plan.js` — SoT extends branch allow-list to include `pipeline-sync-v*` sync branches and accepts `RESULT: DEFERRED — CI Council` as a valid alternative to `RESULT: PASS — <branch>` on PIPELINE-INFRA sync plans
- `.claude/rules/workflow.md` — SoT reworks step 17b (Clean Workbench) to reference the full Clean Workbench Protocol section instead of inlining a short version; uses `git checkout -B main origin/main` to avoid the block-dangerous checkout-main regex, and mandates the orphan-branch sweep
- `.pipeline-version` — bump from `4.1.3` to `4.1.4`

## New Files
(none — every universal file in SoT v4.1.4 already exists in this project)

## Files to Delete
(none — no universal file was retired between v4.1.3 and v4.1.4)

## Files Matching SoT (no action)
- `.claude/settings.json` — matches after render
- `.claude/hooks/block-infra-edit.js` — matches
- `.claude/hooks/block-on-pushback.js` — matches
- `.claude/hooks/require-ci-pass.js` — matches
- `.claude/hooks/manager-stop.js` — matches
- `.claude/hooks/block-redlisted-ops.js` — matches
- `.claude/review-agents/shared-rules.md` — matches
- `.claude/review-agents/agent-1..7-*.md` — match after `{{AGENT_CONTEXT_BLOCKS}}` collapse
- `.claude/rules/coding-standards.md` — matches after `{{SOURCE_ROOT}}` render
- `.claude/scripts/verify-pipeline.sh` — matches after `apps/web` → `apps/thriving-mobile` app_dir substitution
- `.claude/scripts/pre-review-scan.js` — matches after app_dir substitution
- `.github/workflows/ci.yml` — matches after render
- `.github/workflows/council.yml` — matches
- `.github/scripts/code-review.js` — matches
- `.github/scripts/code-review-helpers.js` — matches
- `.github/dependabot.yml` — matches
- `.nvmrc` — matches
- `netlify.toml` — matches after render
- `scripts/check-dead-code.js` — matches after app_dir substitution
- `CLAUDE.md` — matches after full template render
- `docs/DESIGN-TOKENS.md` — matches
- `docs/CODE-PATTERNS.md` — matches
- `DELEGATION.md`, `docs/DESIGN-REGISTRY.md` — per-repo, do not overwrite (present with project content)

## Scope
small (3 universal files overwritten + `.pipeline-version` bumped)

## PRE-PLAN PUSHBACK
<!--
INSTRUCTIONS — This field starts as UNDECLARED and blocks all progress until changed.
Before changing this field, you MUST have:
1. Read the full task description from the human
2. Genuinely considered whether the requested approach has risks, unknowns,
   scope concerns, or improvements worth raising BEFORE planning begins
3. Made a deliberate declaration — not a rubber stamp

To declare no concerns: set to CLEAR-<branch-name>
  Example: CLEAR-nick/add-payment-flow
  This confirms you considered pushback and have none for this branch.

To declare concerns: set to CONCERNS and describe each concern below this field.
  Then STOP all work and surface concerns to Nick.
  Work cannot resume until Nick resolves pushback (see PUSHBACK RESOLVED below).

The hook verifies the branch name suffix matches the current branch.
A previous branch's CLEAR does not carry forward.
-->
PUSHBACK-PREPLAN: CLEAR-pipeline-sync-v4.1.4

## Open PRs Addressed
None open. Preflight `gh pr list --state open` returned an empty array.

## COUNCIL PLAN REVIEW
<!--
INSTRUCTIONS — This field starts as PENDING. Do not change it until ALL of the following are true:
1. You fired all 7 Council agents in parallel on this plan
2. You received a structured receipt from every agent
3. Every agent returned an overall PASS verdict
4. You surfaced the full receipt to Nick as a notification
5. If any agent returned FAIL: you fixed the plan and re-ran the Council
   until all agents PASS — do not set PASS after a partial run

The branch name suffix must match the current branch exactly.
A previous branch's PASS cannot greenlight this branch.

AMENDMENT: If you edit the plan's scope-defining fields (TYPE, Task, Approach,
Files to Change, New Files, Files to Delete) after setting RESULT: PASS, the
prior PASS is invalidated. Reset RESULT to PENDING and re-run the Council
before continuing. This applies equally when you amend the plan to
incorporate a Council INSIGHT.
-->
RESULT: DEFERRED — CI Council

## PUSHBACK RESOLVED
<!--
INSTRUCTIONS — This field is ONLY relevant when PRE-PLAN PUSHBACK is set to CONCERNS.
If no concerns were declared, leave as N/A.

YOU CANNOT SET THIS FIELD YOURSELF. Only Nick's explicit words resolve pushback.
After Nick responds to your concerns and gives clear direction:
  Set to RESOLVED-<branch-name>
  Example: RESOLVED-nick/add-payment-flow

After pushback is resolved:
  - Revise the plan per Nick's direction
  - Reset COUNCIL PLAN REVIEW to PENDING
  - Reset HUMAN APPROVAL to AWAITING
  - Re-run the Council on the revised plan
-->
PUSHBACK-RESOLVED: N/A

## HUMAN APPROVAL
<!--
INSTRUCTIONS — This field starts as AWAITING. It is the most critical gate in the pipeline.
No code is written until this field is CONFIRMED. The require-plan hook enforces this.

To set CONFIRMED, you MUST have:
1. Presented the complete, Council-approved plan to Nick
2. Received explicit approval — "build it", "go", "approved", or equivalent
3. NEVER infer approval from silence, partial acknowledgment, or topic changes

After the PR merges successfully, advance to COMPLETED — PR #[number].
  This consumes the approval — the hook blocks further edits until a new plan is confirmed.
  Do NOT set COMPLETED before merge. The plan stays CONFIRMED through PR creation,
  external review, and CI so the branch remains editable for fixing review rejections or CI failures.
-->
STATUS: CONFIRMED

## POST-BUILD PUSHBACK
<!--
INSTRUCTIONS — This field starts as UNDECLARED and blocks code review until changed.
Before changing this field, you MUST have:
1. Finished building all code for this branch
2. Reviewed your own implementation for risks, surprises, scope creep,
   or concerns that surfaced during the build that weren't visible at planning time
3. Made a deliberate declaration — not a rubber stamp

To declare no concerns: set to CLEAR-PR-<number>
  Example: CLEAR-PR-72
  This confirms you considered post-build pushback and have none for this PR.
  (If the PR hasn't been created yet, use the branch name: CLEAR-<branch-name>)

To declare concerns: set to CONCERNS and describe each concern below this field.
  Then STOP all work and surface concerns to Nick.
  Work cannot resume until Nick resolves the concern.

The hook verifies the suffix matches the current PR/branch.
A previous PR's CLEAR does not carry forward.
-->
PUSHBACK-POSTBUILD: UNDECLARED

## COUNCIL CODE REVIEW
<!--
INSTRUCTIONS — This field starts as PENDING. Do not change it until ALL of the following are true:
1. POST-BUILD PUSHBACK has been declared (not UNDECLARED)
2. You ran the payload size check — if the assembled payload exceeds 75% of
   the model's context window, STOP and recommend splitting the PR
3. You fired all 7 Council agents in parallel on the code diff
4. You received a structured receipt from every agent
5. Every agent returned an overall PASS verdict
6. You surfaced the full receipt to Nick as a notification
7. If any agent returned FAIL: you fixed the code and re-ran the Council
   until all agents PASS — do not set PASS after a partial run

The branch name suffix must match the current branch exactly.
A previous branch's PASS cannot greenlight this branch.
-->
RESULT: PENDING
