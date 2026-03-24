# Plan: Fix Code Review Action — Rate Limit + Permissions

## TYPE
PIPELINE-INFRA

## Task
Fix two issues from the first Code Review Council run: API rate limit (429) from parallel calls, and missing PR comment permission (403).

## Approach
1. code-review.js: Batch API calls 3 at a time with 15s delay, reduce diff truncation to 50K
2. code-review.yml: Add permissions: pull-requests: write, contents: read

## Files to Change
- `.github/scripts/code-review.js` — batched API calls + smaller diff
- `.github/workflows/code-review.yml` — add permissions block

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
None applicable — this is a bug fix for a newly shipped feature.

## COUNCIL_PLAN_REVIEW: PASS

## COUNCIL_CODE_REVIEW: PASS

## STATUS: APPROVED
