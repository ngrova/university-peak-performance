# Workflow

## The Pipeline — 20 Steps, 3 Phases

The user describes what they want in plain English. The system handles everything. No slash commands needed.

### Phase A: Before Code

1. **Human prompts** — Describes what they want.

2. **Pre-flight checks** — Before doing anything else:
   - Clean working tree: `git status --porcelain`. If dirty, commit or discard before proceeding.
   - Main CI health: `gh run list --branch main --limit 1 --json conclusion`. If failed, warn the human.
   - Open PRs: `gh pr list --state open --json number,title,headRefName,updatedAt`. If ANY open PRs exist, STOP. Present the list to the human (PR number, title, branch, age in days) and ask whether to close, merge, or leave them before starting new work. Do not proceed until the human answers. Record the decision in the plan's `## Open PRs Addressed` section.

3. **Pre-plan pushback declaration** — Before planning begins, you MUST declare whether you have concerns about the requested approach. This is mandatory — not optional. Set the `PUSHBACK-PREPLAN` field in the plan file. It starts as `UNDECLARED` which blocks all progress. Change it to `CLEAR-{branch-name}` (no concerns) or `CONCERNS` (describe each concern and STOP — Nick must resolve before work continues). See the plan template's inline instructions for full details.

4. **Create feature branch** — `git fetch origin && git checkout -b nick/short-description origin/main`. No other prefixes. Verify with `git merge-base --is-ancestor origin/main HEAD && echo OK` — if not OK, recreate from origin/main.

5. **Plan creation** — Write `plans/{branch-slug}.md` using the template below.

6. **Council plan review** (local) — Fire all 7 review agents in parallel on the plan. Fix rejections, re-run until all agents PASS. Set `RESULT: PASS` in the plan. Surface the full structured receipt to Nick as a notification — not a gate. Keep working.

7. **Present to human** — Show the plan and Council results. Wait for the human to say "build it." Set `STATUS: CONFIRMED` only after explicit approval.

### Phase B: Writing Code

8. **Build** — Write code on the feature branch. Hooks enforce: require-plan, block-on-pushback, block-infra-edit (Write/Edit); block-dangerous, block-on-pushback, require-ci-pass (Bash). Plus any project-specific hooks from settings.json.

9. **Post-build pushback declaration** — After all code is written, you MUST declare whether concerns surfaced during implementation. This is mandatory — not optional. Set the `PUSHBACK-POSTBUILD` field in the plan file. It starts as `UNDECLARED` which blocks the code review. Change it to `CLEAR-PR-{number}` (no concerns) or `CONCERNS` (describe each concern and STOP). See the plan template's inline instructions for full details.

10. **Council code review** (local, advisory) — Fire all 7 review agents in parallel on the diff. Fix rejections. Surface the full structured receipt to Nick as a notification — not a gate. Keep working. This is fast feedback — the authoritative review runs in GitHub Actions.

### Phase C: Ship

11. **Create PR** — Conventional commit title. Include what/why/how-to-test. Commit the plan file. Get CI run link AFTER the final push: `gh run list --limit 1 --json url --jq '.[0].url'`.

12. **Monitor CI** — Use `gh run watch` or poll with `gh run view`. Report all-pass or which jobs failed. Do not start new work until CI status is known.

13. **External code review** (GitHub Action, hard gate) — Runs automatically. Independent Council review with all 7 agents. Must pass to merge. If rejected, read the PR comment, fix, push — Action re-runs. The plan stays `STATUS: CONFIRMED` during this phase so fixes can be pushed; require-plan continues to permit edits until the PR merges.

14. **CI** (hard gate) — Tests, lint, typecheck, E2E, dead code check. Must pass to merge.

15. **Merge** — Auto-merge proceeds when both external review and CI pass. Run `gh pr merge --auto` so the human doesn't have to visit GitHub.

16. **Lock the plan** — After merge succeeds, set `STATUS: COMPLETED — PR #[number]`. This consumes the approval — require-plan blocks further edits until a new plan is confirmed. Locking happens post-merge (not post-PR-creation) so the branch can still be edited to address external review rejections or CI failures.

17. **Deploy monitoring** — After merge, confirm deploy succeeds. A merge that doesn't deploy is not done.

17b. **Clean Workbench** — After deploy confirms, verify on GitHub that the PR is MERGED (`gh pr view <N> --json state,mergedAt`), then: `git checkout main && git pull origin main`, `git branch -D <branch>` (force-delete — squash-merge makes `-d` refuse because git sees the branch as unmerged even though its contents landed), `git remote prune origin`. Verify: `git status` clean, `git branch --show-current` is `main`, `git branch --list <branch>` empty. If any check fails, STOP and report. Do not proceed to Step 18 with a lingering feature branch.

18. **Post-PR retrospective** — This is mandatory. Write a retrospective to `ngrova/pipeline` at `retros/<project>/<YYYY.MM.DD>_pr<N>_<slug>.md`. Include a link to the Council JSON artifact for this PR (the `council-ledger` artifact on the external review workflow run; 90-day retention). Review your entire PR cycle from plan through merge using this structure:

    **Review Cycle Summary**
    - Plan review passes: [count — how many rounds before the Council approved the plan]
    - Local code review passes: [count]
    - External Council passes: [count — how many pushes before the GitHub Action approved]
    - Total cycles: [sum]

    **What the pipeline caught (working as intended)**
    List each rejection that found a real bug — a problem that would have shipped broken or insecure. For each: which agent, what it caught, why it mattered. These are wins. If the pipeline caught nothing real, write "Clean pass — no real issues caught." Do not fabricate catches.

    **What was pipeline friction (needs improvement)**
    List each rejection or delay caused by the pipeline itself — rule ambiguity, tooling bugs, missing context, hallucinated concerns, process bottlenecks, hook conflicts. These are NOT code bugs you wrote. These are problems the pipeline caused. For each:
    - What happened
    - Root cause (why the pipeline behaved this way)
    - Suggested fix (what should change in the pipeline, and which file)
    If no friction: "Clean run — no pipeline friction encountered."

    **If I could restart this PR**
    What would you do differently knowing what you know now? Different plan structure, different approach, different file organization? If nothing: "No changes — approach was correct."

    **Recommended pipeline improvements**
    If you were to make change(s) to improve the pipeline to produce higher quality code and products, more reliably, what change(s) would you make? State what and why. If nothing: "No recommendations."

    **Council process feedback**
    [Aggregated from all three Council firings (steps 6, 10, 13). Include any agent observations about the checklist itself — questions that didn't apply, were unclear, or patterns the questions don't cover. If no agent had feedback: "None."]

19. **Present retrospective** — Present your retrospective to the human in the terminal: "Here's my feedback on the pipeline for this PR. If you'd like, you can send this to Paul." Do not ask a question — just present the feedback and let the human decide.

20. **Commit retrospective to pipeline repo** — Commit the retrospective file to `ngrova/pipeline` with message `retro(<project>): pr<N> <slug>`. Direct commit to main — no PR, no Council review. If the commit fails (network, auth, repo unreachable), STOP and report to the human with the retrospective body printed inline so no feedback is lost.

## Plan File Template

Plan files live in `plans/{branch-slug}.md` (slug = branch name with `/` → `-`). Committed to branches so the GitHub Action can read them.

Every gate variable has an inline instruction block. These instructions are part of the template — they ship with every plan file. They exist so you cannot change a variable without reading what changing it requires.

```
# Plan: [Feature Name]

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
TYPE: [FEATURE | REDESIGN | PIPELINE-INFRA | DOCS]

## Task
[What and why — plain English from the human]

## Approach
[How to build it — step by step]

## Files to Change
- path/to/file.tsx — what changes

## New Files
- path/to/new-file.tsx — what it does (skip section if none)

## Files to Delete
- path/to/old-file.tsx — reason (REDESIGN and PIPELINE-INFRA only; skip section for FEATURE)

## Scope
[small (1-3 files) | medium (4-7 files) | large (8+ files)]

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
PUSHBACK-PREPLAN: UNDECLARED

## Open PRs Addressed
[From preflight open PR check. List each open PR (#, title, branch, age) and the decision made with Nick: close, merge, or leave with reason.]
[Write "None open." if preflight found no open PRs.]

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
RESULT: PENDING

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
STATUS: AWAITING

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
```

## Variable Enforcement Summary

Seven gate variables, each with inline instructions at the point of change:

1. **TYPE** — Behavior modifier. Controls which hooks apply (PIPELINE-INFRA unlocks infra edits) AND which Council sections fire (DOCS and PIPELINE-INFRA short-circuit runtime-only checks).
2. **PUSHBACK-PREPLAN** — Mandatory declaration at step 3. `UNDECLARED` blocks all progress. `CLEAR-{branch}` or `CONCERNS`.
3. **COUNCIL PLAN REVIEW RESULT** — Set after all 7 agents PASS. Branch-matched suffix prevents carry-over.
4. **PUSHBACK-RESOLVED** — Human-only field. Only Nick's words unlock it. Resets council and approval.
5. **HUMAN APPROVAL STATUS** — `AWAITING` → `CONFIRMED` (explicit approval) → `COMPLETED — PR #{number}` (post-merge).
6. **PUSHBACK-POSTBUILD** — Mandatory declaration at step 9. `UNDECLARED` blocks code review. `CLEAR-PR-{number}` or `CONCERNS`.
7. **COUNCIL CODE REVIEW RESULT** — Set after all 7 agents PASS on code. Branch-matched suffix prevents carry-over.

Retrospectives are not a gate variable — they are a post-merge step that writes durable output to the `ngrova/pipeline` repo (see Retrospectives section). The artifact is the proof of work, not a plan field.

**Reset rules:** New task = new branch = new plan file. Every variable starts fresh. Nothing carries over between branches. After pushback resolved mid-plan: COUNCIL PLAN REVIEW resets to PENDING, HUMAN APPROVAL resets to AWAITING.

## Branch Naming

Feature branches must use `nick/short-description`. The require-plan hook blocks code edits on branches without the `nick/` prefix.

## Git Conventions

- Never commit directly to main — all changes go through PRs
- Never force push any branch
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

## PR Descriptions

- **What** changed (1-3 bullet points)
- **Why** (the user need or bug being fixed)
- **How to test** (steps to verify)

## REDESIGN PRs

- TYPE: REDESIGN for replacing, consolidating, or removing existing code
- Unlocks "Files to Delete" section — every deletion needs a reason
- Agents 2, 3, 4 apply conditional REDESIGN rules
- REDESIGN PRs deleting 10+ files should be split

## E2E Testing

Feature PRs with user-facing changes must include Playwright tests. Infrastructure-only changes are exempt. Tests live in the project's test directory.

## Pipeline Feedback Loop

- After every merged PR, present a structured retrospective to the human (Steps 18–20)
- The retrospective is committed to `ngrova/pipeline` at `retros/<project>/<YYYY.MM.DD>_pr<N>_<slug>.md` and presented inline in the terminal
- Every retrospective must link to the Council JSON artifact for that PR (90-day retention)
- The human routes actionable findings to Paul (the pipeline architect)
- Do not append lessons to CLAUDE.md — improvements flow through the retrospective, not file edits
