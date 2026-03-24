# Plan: Add Mandatory Pushback Section to Plan Files

## TYPE
FEATURE

## Task
Add a required `## Pushback` section to the plan file template. Agent 6 rejects plans without it. Update require-plan.js to validate it exists. Update CLAUDE.md to document the two-layer pushback system (proactive via plan file, reactive via PUSHBACK file).

## Approach
1. Update plan file template in `.claude/rules/workflow.md` — add `## Pushback` before `## STATUS`
2. Update `require-plan.js` — when reading plan content, also check for `## Pushback` section
3. Update Agent 6 in `.claude/skills/review-plan/SKILL.md` — reject missing/empty pushback section, flag unacknowledged concerns
4. Update `CLAUDE.md` Pushback Enforcement section — document Layer 1 (plan) + Layer 2 (PUSHBACK file)

## Files to Change
- `.claude/rules/workflow.md` — add Pushback section to plan template
- `.claude/hooks/require-plan.js` — validate Pushback section exists in plan files
- `.claude/skills/review-plan/SKILL.md` — add Agent 6 pushback checks
- `CLAUDE.md` — update Pushback Enforcement to describe two-layer system

## Scope
small

## Pushback
None — proceeding as specified.

## COUNCIL_CODE_REVIEW: PASS

## STATUS: COMPLETED
