# Plan: Pipeline Enforcement v2 — Phase 1

## TYPE
PIPELINE-INFRA

## Task
Close 5 pipeline gaps by extending existing hooks. Add COUNCIL_PLAN_REVIEW enforcement, pushback content validation, infrastructure protection hook, and Lessons Addressed plan section.

## Approach
1. require-plan.js: Add COUNCIL_PLAN_REVIEW: PASS check + pushback content validation
2. block-infra-edit.js: New hook protecting .claude/ infrastructure (requires PIPELINE-INFRA plan)
3. settings.json: Register new hook
4. review-plan SKILL.md: Write COUNCIL_PLAN_REVIEW marker + Agent 6 lessons check
5. workflow.md: Update plan template with Lessons Addressed + PIPELINE-INFRA type
6. CLAUDE.md: Update pipeline docs

## Files to Change
- `.claude/hooks/require-plan.js` — add 2 new checks (~20 lines)
- `.claude/settings.json` — register block-infra-edit.js
- `.claude/skills/review-plan/SKILL.md` — add COUNCIL_PLAN_REVIEW write step + Agent 6 update
- `.claude/rules/workflow.md` — update plan template
- `CLAUDE.md` — update pipeline docs

## New Files
- `.claude/hooks/block-infra-edit.js` — infrastructure protection hook (~45 lines)

## Scope
medium

## Pushback
None — proceeding as specified. Phased approach accepted by human.

## Lessons Addressed
- 2026-03-19: "Always reset plan file to STATUS: COMPLETED after shipping" — partially mitigated by COUNCIL_PLAN_REVIEW check (stale approvals won't have the review marker)
- 2026-03-22: "Never skip the 9-agent review" — directly enforced by COUNCIL_PLAN_REVIEW: PASS requirement in require-plan.js

## COUNCIL_PLAN_REVIEW: PASS

## COUNCIL_CODE_REVIEW: PASS

## STATUS: COMPLETED
