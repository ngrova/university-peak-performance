# Plan: Add Retry Logic and EXEMPT Verdict to Code Review Script

## TYPE
PIPELINE-INFRA

## Task
Two enhancements to the GitHub Action code review script:
1. When an agent API call returns 429 (rate limit) or 529 (overloaded), wait 30 seconds and retry up to 3 times before marking it as failed.
2. Add EXEMPT as a distinct approved verdict — currently EXEMPT is silently mapped to "APPROVED" in the output. Keep it as "EXEMPT" so the PR comment shows which agents exempted themselves, but treat it as passing.

## Approach
1. Add a `fetchWithRetry` helper that wraps `fetch` — on 429/529, waits 30s and retries up to 3 times. Used by `reviewAgent`.
2. Change verdict parsing to preserve "EXEMPT" as its own verdict instead of mapping to "APPROVED".
3. Update the pass check to include EXEMPT alongside APPROVED and WARN.
4. Update the workflow YAML icon function to show a distinct icon for EXEMPT.

## Files to Change
- `.github/scripts/code-review.js` — add fetchWithRetry helper, preserve EXEMPT verdict, update pass check
- `.github/workflows/code-review.yml` — add EXEMPT icon in the PR comment rendering

## New Files
None

## Scope
small

## Pushback
None — proceeding as specified.

## Lessons Addressed
None applicable to this task.

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #160

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
