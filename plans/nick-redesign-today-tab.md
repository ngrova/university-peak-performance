# Plan: Redesign Today tab — coach-style One Thing focus screen

## TYPE
REDESIGN

## Task
Replace the list-based Today tab with a coach-style focus screen. Hero card for the One Thing (scored by priority + deadline weights), "Why this?" explanation box, Mark Complete button, and a muted Up Next section showing 2-3 tasks. No separate overdue section. Extensible scoring for future assessment pillar weights.

## Approach
- New server action fetchTodayTasks returns all active tasks with context (replaces 3 separate fetchers)
- New client-side scoring utility (priority weight + deadline weight, extensible for pillar scores)
- New client-side "Why this?" text generator from task properties
- Rewrite TodayContent as hero + up-next layout matching the HTML mockup
- New TodayHero component (green-bordered card, title, context, chips, why-box, complete button)
- New UpNextSection component (2-3 small muted rows)
- Delete QueueList and OverdueList (replaced by the new layout)
- Keep GreetingBar (still used)

## Files to Change
- `apps/thriving-mobile/src/components/TodayContent.tsx` — rewrite as hero + up-next layout
- `apps/thriving-mobile/src/actions/today-actions.ts` — replace 3 fetchers with single fetchTodayTasks
- `docs/DESIGN-REGISTRY.md` — update Today tab entry to reflect new design

## New Files
- `apps/thriving-mobile/src/lib/one-thing-score.ts` — scoring algorithm, structured for pillar weight extension
- `apps/thriving-mobile/src/lib/why-this.ts` — template-based explanation generator
- `apps/thriving-mobile/src/components/TodayHero.tsx` — hero card matching mockup
- `apps/thriving-mobile/src/components/UpNextSection.tsx` — muted 2-3 task preview rows

## Files to Delete
- `apps/thriving-mobile/src/components/QueueList.tsx` — replaced by UpNextSection
- `apps/thriving-mobile/src/components/OverdueList.tsx` — no separate overdue section in new design
- `apps/thriving-mobile/src/components/OneThingCard.tsx` — replaced by TodayHero

## Scope
large (4 new, 3 modified, 3 deleted = 10 files)

## STATUS: COMPLETED
