# Plan: Add WARN verdict for pre-existing violations in Code Review Council

## TYPE
PIPELINE-INFRA

## Task
Teach agents to distinguish violations INTRODUCED by the diff (REJECT) from pre-existing violations visible in context lines (WARN). WARN does not block merge. Show warnings in a separate section of the PR comment.

## Approach
1. Add a preamble to all 9 agent prompt files explaining the APPROVED/WARN/REJECTED distinction
2. Update verdict parser in code-review.js to treat WARN as passing
3. Update PR comment template in code-review.yml to show warnings separately

## Files to Change
- `.claude/review-agents/agent-1-security.md` through `agent-9-silent-failure.md` — add preamble
- `.github/scripts/code-review.js` — WARN verdict parsing
- `.github/workflows/code-review.yml` — separate warnings section in comment

## Scope
medium

## Pushback
None — proceeding as specified.

## Lessons Addressed
None applicable.

## COUNCIL_PLAN_REVIEW: PASS

## COUNCIL_CODE_REVIEW: PASS

## STATUS: APPROVED
