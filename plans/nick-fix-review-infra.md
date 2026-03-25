# Plan: Fix Code Review Council Infrastructure

## TYPE
PIPELINE-INFRA

## Task
Fix three systematic issues in the Code Review Council: rate limiting, verdict parsing, and Agent 4 false positives on non-code files.

## Approach
1. code-review.js: Change from batched (3 at 15s) to sequential (1 at 13s) to stay under 5 req/min
2. code-review.js: Add EXEMPT to approved verdict patterns alongside APPROVED
3. agent-4-coding-standards.md: Clarify file header rule applies only to .ts/.tsx files in apps/, not markdown plan files

## Files to Change
- `.github/scripts/code-review.js` — sequential execution + EXEMPT parsing
- `.claude/review-agents/agent-4-coding-standards.md` — scope file header rule

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
None applicable — fixing infrastructure bugs from initial deployment.

## COUNCIL_PLAN_REVIEW: PASS

## COUNCIL_CODE_REVIEW: PASS

## STATUS: APPROVED
