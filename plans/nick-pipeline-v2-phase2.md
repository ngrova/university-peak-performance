# Plan: Pipeline Enforcement v2 — Phase 2: Independent Code Review

## TYPE
PIPELINE-INFRA

## Task
Move the 9-agent code review into a GitHub Action that runs independently on every PR. Extract review prompts to shared files. Un-gitignore plan files so the Action can read them. This creates the independent trust boundary — Claude Code cannot skip, forge, or influence the results.

## Approach
1. Extract 9 agent prompts from SKILL.md to `.claude/review-agents/agent-N-name.md`
2. Create `.github/scripts/code-review.js` — Node.js script calling Anthropic API in parallel
3. Create `.github/workflows/code-review.yml` — triggers on PR, runs review, posts comment
4. Remove `plans/` from `.gitignore` so plan files are available to the Action
5. Update SKILL.md to reference shared prompt files + add advisory note
6. Update CLAUDE.md pipeline docs
7. Update workflow.md plan file tracking note

## Files to Change
- `.claude/skills/review-plan/SKILL.md` — reference shared prompts, add advisory note
- `.gitignore` — remove `plans/` exclusion
- `.claude/rules/workflow.md` — update plan file tracking
- `CLAUDE.md` — update pipeline and CI docs

## New Files
- `.claude/review-agents/agent-1-security.md` through `agent-9-silent-failure.md`
- `.github/scripts/code-review.js`
- `.github/workflows/code-review.yml`

## Scope
large

## Pushback
None — proceeding as specified.

## Lessons Addressed
- 2026-03-22: "Never skip the 9-agent review" — directly enforced by making the review a required GitHub Action check that Claude Code cannot bypass
- 2026-03-23: "Sub-agents bypassed 9-agent review" — the GitHub Action runs regardless of how the PR was created

## COUNCIL_PLAN_REVIEW: PASS

## COUNCIL_CODE_REVIEW: PASS
Agent 6 rejected for dirty working tree — resolved: untracked plan files are intentional (un-gitignored by this PR).

## STATUS: APPROVED
