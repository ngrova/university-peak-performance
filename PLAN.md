# Plan: Upgrade review agent council from 8 to 9 agents with breakage-focused prompts

## Task
"Replace all agent prompts with production-incident-informed versions. Add Agent 9 (Silent Failure Detector). Update all references from 8 to 9 agents."

## Approach
- Replace all 8 existing agent prompts in SKILL.md with improved versions that ask "how could this silently break?" not just "does this follow rules?"
- Add Agent 9 — Silent Failure Detector (catches empty catches, indistinguishable error/success paths)
- Rename Agent 5 from "Decision Conflict" to "Integration Correctness" (checks runtime compatibility)
- Update description, step counts, and result table from 8 → 9
- Update CLAUDE.md and workflow.md references from 8 → 9

## Files to Change
- `.claude/skills/review-plan/SKILL.md` — replace all prompts, add Agent 9, update counts
- `.claude/rules/workflow.md` — update 8 → 9 in pipeline steps
- `CLAUDE.md` — update 7 → 9 in pipeline description

## Scope
medium (3 files — all config/docs, no application code)

## STATUS: APPROVED
