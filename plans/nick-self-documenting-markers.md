# Plan: Self-Documenting Plan Markers + Pipeline Flow Cleanup

## TYPE
PIPELINE-INFRA

## Task
Replace mechanical plan markers with self-documenting questions. Consolidate pipeline documentation. Update hooks for backward compatibility with old markers during transition.

## Approach
1. Rewrite workflow.md with 17-step flow + new plan template
2. Trim CLAUDE.md pipeline sections to reference workflow.md
3. Update require-plan.js marker checks + add branch naming + backward compat
4. Update SKILL.md marker write instructions
5. Update .git/hooks/pre-push for dual-format support

## Files to Change
- `.claude/rules/workflow.md` — full rewrite
- `CLAUDE.md` — consolidate pipeline sections
- `.claude/hooks/require-plan.js` — new markers + backward compat + branch naming
- `.claude/skills/review-plan/SKILL.md` — update marker instructions
- `.git/hooks/pre-push` — accept both old and new markers

## Scope
medium — 5 files

## Pushback
None — proceeding as specified. Clean tree check kept as documented procedure, not hook gate.

## Lessons Addressed
- 2026-03-19: "Always reset plan file after shipping" — directly addressed by the new HUMAN APPROVAL lifecycle (AWAITING → CONFIRMED → COMPLETED)
- 2026-03-22: "Never skip the 9-agent review" — reinforced by self-documenting marker that asks "Have all 9 review agents reviewed and approved this plan?"

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it and given direction?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and the 9-agent review results, and confirmed "build it"?
STATUS: CONFIRMED
STATUS: APPROVED

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
