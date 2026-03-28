# Plan: Council Hallucination Fix

## TYPE
PIPELINE-INFRA

## Task
Fix the Code Review Council's recurring hallucination problem — agents cite code that doesn't exist in the diff. Two confirmed incidents (PRs #179 and #182) where agents fabricated function names, invented catch block behavior, and applied wrong-codebase patterns. Add three grounding rules to the agent prompts: verbatim citation requirement, self-check gate, and no-test baseline awareness.

## Approach
1. Add a **Verbatim Citation Rule** to all 4 agent prompts requiring every concern to include exact code copied from the diff
2. Add a **Self-Check Gate** to all 4 agent prompts requiring a re-read of the diff before submitting, dropping any concern whose cited code can't be found
3. Add a **No-Test Baseline Awareness** rule to Agent 4 only, preventing "no tests = regression" flags when the codebase has no test infrastructure
4. Preserve all existing prompt content — these rules are additive

## Files to Change
- `.claude/review-agents/agent-1-security-data-integrity.md` — add citation rule + self-check gate
- `.claude/review-agents/agent-2-code-quality-standards.md` — add citation rule + self-check gate
- `.claude/review-agents/agent-3-correctness-integration.md` — add citation rule + self-check gate
- `.claude/review-agents/agent-4-reliability-testing.md` — add citation rule + self-check gate + no-test baseline awareness

## Scope
small

## Pushback
None — proceeding as specified. The prompt changes are the right first step. A structural follow-up (injecting line numbers into diffs, requiring agents to output structured JSON with machine-verifiable citations) could further reduce hallucinations but is a separate PR scope.

## Lessons Addressed
- **Never override a review agent rejection:** These changes aim to eliminate the need for overrides by reducing false rejections.
- **Never skip council review:** This PR goes through the full pipeline — and the council reviewing its own prompt improvements IS the test.

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
