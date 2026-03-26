# Plan: Optimize Code Review Council

## TYPE
PIPELINE-INFRA

## Task
The code review council in GitHub Actions takes 9-44 minutes per PR. Consolidate from 9 agents to 4 to cut API calls in half, show full rejection reasons in PR comments, increase inter-agent delay to 60s to avoid rate limits, and add smart diff summarization instead of blind truncation. Rename to "Code Review Council" everywhere (no agent count in name).

## Approach

### 1. Consolidate agent prompts (9 to 4)
Delete 9 existing files, create 4 new ones:
- Agent 1 (Security & Data Integrity): merges old 1 + 2
- Agent 2 (Code Quality & Standards): merges old 3 + 4 + 7
- Agent 3 (Correctness & Integration): merges old 5 + 6
- Agent 4 (Reliability & Testing): merges old 8 + 9

### 2. Split code-review.js (currently 113 lines, over limit)
- `code-review.js` (~45 lines) — orchestrator with 60s delay
- `code-review-helpers.js` (NEW, ~85 lines) — fetchWithRetry, reviewAgent, readInputs, buildSmartDiff

### 3. Smart diff summarization
Parse diff into per-file chunks, prioritize actions/migrations/config/.github files, build file manifest, fill to 40K limit.

### 4. Full rejection reasons in PR comments
Compact table + collapsible `<details>` blocks for REJECTED agents.

### 5. Rename to "Code Review Council" everywhere
No agent count in the name. Update branch protection via API.

### 6. Update all pipeline references
CLAUDE.md, workflow.md, SKILL.md — "9-agent" to "council" or just remove count.

## Files to Change
- `.github/workflows/code-review.yml` — rename, restructure PR comment
- `.github/scripts/code-review.js` — slim orchestrator, 60s delay
- `CLAUDE.md` — update references
- `.claude/rules/workflow.md` — update template labels
- `.claude/skills/review-plan/SKILL.md` — rewrite with 4 inline prompts

## New Files
- `.github/scripts/code-review-helpers.js` — extracted helpers + smart diff
- `.claude/review-agents/agent-1-security-data-integrity.md`
- `.claude/review-agents/agent-2-code-quality-standards.md`
- `.claude/review-agents/agent-3-correctness-integration.md`
- `.claude/review-agents/agent-4-reliability-testing.md`

## Files to Delete
- `.claude/review-agents/agent-1-security.md` — merged into new agent-1
- `.claude/review-agents/agent-2-data-integrity.md` — merged into new agent-1
- `.claude/review-agents/agent-3-code-reuse.md` — merged into new agent-2
- `.claude/review-agents/agent-4-coding-standards.md` — merged into new agent-2
- `.claude/review-agents/agent-5-integration.md` — merged into new agent-3
- `.claude/review-agents/agent-6-scope-fidelity.md` — merged into new agent-3
- `.claude/review-agents/agent-7-pattern-consistency.md` — merged into new agent-2
- `.claude/review-agents/agent-8-test-coverage.md` — merged into new agent-4
- `.claude/review-agents/agent-9-silent-failure.md` — merged into new agent-4

## Scope
large

## Pushback
TYPE changed to PIPELINE-INFRA per CLAUDE.md rules (review agent changes). CI parallelism already confirmed — both workflows start within 5 seconds of each other. Branch protection requires updating "9-Agent Code Review" to "Code Review Council" via API.

## Lessons Addressed
- 2026-03-22: "Never skip the review" — all concerns preserved across 4 agents with defense-in-depth.
- 2026-03-23: "Sub-agents bypassed review" — GitHub Action enforcement unchanged, only agent count and prompts change.

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
ACKNOWLEDGED — human confirmed "build it" after reviewing pushback.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: APPROVED

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PENDING
