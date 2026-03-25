# Workflow

## The Pipeline — 17 Steps, 3 Phases

The user describes what they want in plain English. The system handles everything. No slash commands needed.

### Phase A: Before Code

1. **Human prompts** — Describes what they want.

2. **Pre-flight checks** — Before doing anything else:
   - Clean working tree: `git status --porcelain`. If dirty, commit or discard before proceeding.
   - Main CI health: `gh run list --branch main --limit 1 --json conclusion`. If failed, warn the human.
   - Last PR: verify previous PR isn't stuck or broken. If it is, flag it.
   - Lessons buffer: check CLAUDE.md Lessons Learned. Address in the plan's ## Lessons Addressed section.

3. **Pushback check** — Do I have concerns about what the human asked for? If yes → report and STOP. If no → continue.

4. **Create feature branch** — `nick/short-description` or `erin/short-description`. No other prefixes.

5. **Plan creation** — Write `plans/{branch-slug}.md` using the template below.

6. **9-agent plan review** (local) — Spawn all 9 agents. Fix rejections, re-run until all 9 approve. Set `RESULT: PASS` in the plan.

7. **Present to human** — Show the plan and results. Wait for the human to say "build it." Set `STATUS: CONFIRMED` only after explicit approval.

### Phase B: Writing Code

8. **Build** — Write code on the feature branch. Hooks enforce: require-plan, block-on-pushback, block-archived, block-infra-edit (Write/Edit); block-dangerous, block-on-pushback, require-ci-pass (Bash).

9. **Mid-task pushback** (if needed) — If a concern surfaces during implementation, create `plans/PUSHBACK-{branch-slug}.md`. The hook locks ALL operations until the human resolves it.

10. **9-agent code review** (local, advisory) — Spawn all 9 agents on the diff. Fix rejections. This is fast feedback — the authoritative review runs in GitHub Actions.

### Phase C: Ship

11. **Create PR** — Conventional commit title. Include what/why/how-to-test. Commit the plan file. Get CI run link AFTER the final push: `gh run list --limit 1 --json url --jq '.[0].url'`.

12. **Lock the plan** — Set `STATUS: COMPLETED — PR #[number]`. This consumes the approval — require-plan blocks further edits until a new plan is confirmed.

13. **Monitor CI** — Use `gh run watch` or poll with `gh run view`. Report all-pass or which jobs failed. Do not start new work until CI status is known.

14. **External code review** (GitHub Action, hard gate) — Runs automatically. Independent 9-agent review. Must pass to merge. If rejected, read the PR comment, fix, push — Action re-runs.

15. **CI** (hard gate) — Tests, lint, typecheck, E2E. Must pass to merge.

16. **Merge** — Auto-merge proceeds when both external review and CI pass.

17. **Deploy monitoring** — After merge, confirm Netlify deploy succeeds. A merge that doesn't deploy is not done.

## Plan File Template

Plan files live in `plans/{branch-slug}.md` (slug = branch name with `/` → `-`). Committed to branches so the GitHub Action can read them.

```
# Plan: [Feature Name]

## TYPE
[FEATURE | REDESIGN | PIPELINE-INFRA]

## Task
[What and why — plain English from the human]

## Approach
[How to build it — step by step]

## Files to Change
- path/to/file.tsx — what changes

## New Files
- path/to/new-file.tsx — what it does (skip if none)

## Files to Delete
- path/to/old-file.tsx — reason (REDESIGN only; skip for FEATURE)

## Scope
[small | medium | large]

## Pushback
[Before planning, did you identify any concerns, risks, or improvements?]
[Write "None — proceeding as specified." if no concerns.]
[If concerns: describe, recommend alternative, state what the human needs to decide. Then STOP.]

## Lessons Addressed
[Which lessons from CLAUDE.md apply? How are they handled?]
[Write "None applicable to this task." if none apply.]

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: [PENDING | PASS | FAIL]

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
[N/A — no pushback declared.]
[ACKNOWLEDGED — set only after explicit human confirmation.]

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: [AWAITING | CONFIRMED | COMPLETED — PR #[number]]

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: [PENDING | PASS | FAIL]
```

## Variable Reset Rules

1. **After PR created:** HUMAN APPROVAL advances to `COMPLETED — PR #[number]`. The hook only allows code edits when status is `CONFIRMED`, not `COMPLETED`.
2. **After pushback resolved + plan revised:** 9-AGENT PLAN REVIEW resets to `PENDING`. HUMAN APPROVAL resets to `AWAITING`.
3. **New task = new branch = new plan file.** Nothing carries over between branches.

## Branch Naming

Feature branches must use `nick/short-description` or `erin/short-description`. The require-plan hook blocks code edits on branches without the `nick/` or `erin/` prefix.

## Git Conventions

- Never commit directly to main — all changes go through PRs
- Never force push any branch
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

## PR Descriptions

- **What** changed (1-3 bullet points)
- **Why** (the user need or bug being fixed)
- **How to test** (steps to verify on phone)

## REDESIGN PRs

- TYPE: REDESIGN for replacing, consolidating, or removing existing code
- Unlocks "Files to Delete" section — every deletion needs a reason
- Agents 3, 6, 8 apply conditional REDESIGN rules
- REDESIGN PRs deleting 10+ files should be split

## E2E Testing

Feature PRs with user-facing changes must include Playwright tests. Infrastructure-only changes are exempt. Tests live in `apps/thriving-mobile/e2e/`.

## Learning from Corrections

- Append dated one-liners to CLAUDE.md Lessons Learned
- Lessons that repeat 3x get promoted to permanent rules in .claude/rules/
