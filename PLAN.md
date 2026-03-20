# Plan: PR 2 — Design Registry + Agent 7 Integration

## TYPE
FEATURE

## Task

Create docs/DESIGN-REGISTRY.md seeded with all shared UI patterns from Phases 1-4. Update Agent 7 with registry-aware checks and touch-it-improve-it rule. Add registry update reminder to make-plan skill. PR 2 of 3 in pipeline evolution spec.

## Approach

- Create docs/DESIGN-REGISTRY.md listing all canonical shared components with file paths, phases, and usage rules
- Add REDESIGN + registry conditional block to Agent 7 in review-plan SKILL.md
- Add registry check reminder to make-plan SKILL.md Step 2
- Add CLAUDE.md rule: check DESIGN-REGISTRY.md before building any UI component

## Files to Change

- `.claude/skills/review-plan/SKILL.md` — add registry clause + touch-it-improve-it to Agent 7
- `.claude/skills/make-plan/SKILL.md` — add registry check reminder
- `CLAUDE.md` — add design registry rule to Coding Principles

## New Files

- `docs/DESIGN-REGISTRY.md` — seeded with all shared patterns from Phases 1-4

## Scope
small (4 files — 3 modified, 1 new)

## STATUS: APPROVED
