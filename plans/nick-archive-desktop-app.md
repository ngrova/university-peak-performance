# Plan: Archive Desktop App — Prevent Cross-App Contamination

## TYPE
REDESIGN

## Task
Rename apps/thriving to apps/_archived-thriving-desktop, exclude from builds/CI, add mechanical guard hook, update all references. Preserve git history via git mv.

## Approach

### 1. Rename directory
`git mv apps/thriving apps/_archived-thriving-desktop`

### 2. Exclude from builds
- `pnpm-workspace.yaml` — add `!apps/_archived-thriving-desktop` exclusion
- `netlify.toml` — change filter from `@upp/thriving` to `@upp/thriving-mobile`, publish dir to `apps/thriving-mobile/.next`, ignore path to `apps/thriving-mobile/`

### 3. Fix manager-stop.js
Change hardcoded `apps/thriving` cwd to `apps/thriving-mobile` for typecheck and vitest

### 4. Update CI
`.github/workflows/ci.yml` — update RLS test working-directory from `apps/thriving` to `apps/thriving-mobile`

### 5. Add Active App Rule to CLAUDE.md
Permanent rule: thriving-mobile is the active app, _archived-thriving-desktop is reference only

### 6. Create block-archived.js hook
Block Write/Edit to files under `apps/_archived-thriving-desktop/`. Register in settings.json.

### 7. Update other references
- `apps/mission-control/src/app/api/activity/route.ts` — add thriving-mobile detection, update thriving path to _archived
- `.claude/skills/review-plan/SKILL.md` — update Agent 5 cross-app reference
- `docs/30_DAY_LAUNCH_PLAN.md` — update architecture section
- Run `pnpm install` to regenerate lockfile

## Files to Change
- `pnpm-workspace.yaml` — add exclusion
- `netlify.toml` — switch build to thriving-mobile
- `.claude/hooks/manager-stop.js` — fix cwd to thriving-mobile
- `.github/workflows/ci.yml` — update RLS test paths
- `CLAUDE.md` — add Active App Rule + update monorepo structure
- `.claude/settings.json` — register block-archived hook
- `.claude/skills/review-plan/SKILL.md` — update Agent 5
- `apps/mission-control/src/app/api/activity/route.ts` — update detectApp
- `docs/30_DAY_LAUNCH_PLAN.md` — update architecture

## New Files
- `.claude/hooks/block-archived.js` — guard hook blocking edits to archived app

## Files to Delete
- `apps/thriving/` — renamed to `apps/_archived-thriving-desktop/` via git mv (not deleted)

## Scope
large

## Pushback
None — proceeding as specified.

## COUNCIL_CODE_REVIEW: PASS
9/9 approved.

## STATUS: COMPLETED
