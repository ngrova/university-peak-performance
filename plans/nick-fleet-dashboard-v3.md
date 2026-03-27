# Plan: Fleet Dashboard v3 — Human-Centric Scoreboard

## TYPE
REDESIGN

## Task
Rebuild the fleet dashboard from a raw data dump into a human-centric scoreboard. The new design answers "What did Nick and Erin accomplish today?" with two human cards showing active hours, stats, activity timelines, and accomplishments — driven by AI agent data. Includes date navigation, compact agent bar with click-to-expand, two-column grid with fleet chatter and open items/decisions.

## Approach

### Backend (queries.ts, stats.ts, index.ts)
1. **Add date parameter** — Accept `?date=YYYY-MM-DD` query param. Default to today in Eastern Time (America/New_York). Filter all queries to midnight-to-midnight for that date.
2. **Add agent lookup map** — Build `agentMap` from fleet_agents (agent_id → display_name, owner, role). Return this map in the response so the frontend can resolve agent_ids to display names and determine which human owns each post.
3. **Rebuild stats.ts** — Compute human-centric stats: per-human PR count (kind=progress posts), decisions count (from fleet_decisions decided_by), post count, active hours (first/last post timestamps), accomplishments (kind=progress or blocker_resolved).
4. **Increase message limit** — Bump from 50 to 200 for the selected date to capture a full day's activity.

### Frontend (index.html) — Complete rebuild
5. **Layer 1: Today's Scoreboard** — Two human cards side by side (Nick blue, Erin purple). Each shows: name + active hours, stats row (PRs shipped, decisions, posts), activity timeline bar, accomplishments list with "via [agent]" attribution.
6. **Layer 2: Fleet Agents bar** — Three compact horizontal cards with avatar initial, display_name, title (from role), last active time. Clickable — expands a panel below showing that agent's full post history for the date.
7. **Layer 3: Two-column grid** — Left: Fleet Chatter (all posts, routing like "Tobias to Luke" or "Tobias to all", kind badge, session label). Right top: Open Items with urgency badges. Right bottom: Decisions with decided_by.
8. **Date picker** — At top of page next to title. Native `<input type="date">` styled to match dark theme. Changes trigger re-fetch with date param.
9. **Design system** — Match mockup exactly: dark theme, card borders, badge colors, font sizes, spacing.

### Data flow
- Frontend sends `GET /.netlify/functions/fleet-dashboard?date=2026-03-27`
- Backend filters all queries to that date (Eastern time)
- Backend returns: agents, messages, decisions, open_items, agent_map, human_stats
- Frontend renders everything client-side using agent_map to resolve display names and ownership

## Files to Change
- fleet-sync-server/netlify/functions/fleet-dashboard/queries.ts — Add date filtering on all queries, increase limits
- fleet-sync-server/netlify/functions/fleet-dashboard/stats.ts — Rebuild for human-centric metrics (per-human stats, accomplishments, active hours)
- fleet-sync-server/netlify/functions/fleet-dashboard/index.ts — Parse date query param, pass to queries, restructure response
- fleet-sync-server/index.html — Full rebuild matching mockup design

## Files to Delete
- None — all changes are in-place rewrites of existing files

## Scope
large

## Pushback
None — proceeding as specified. The design is well-defined with a mockup. One note: the accomplishments list relies on kind="progress" and kind="blocker_resolved" — if agents don't consistently use these kinds, the list may be sparse. But this is a data quality issue, not a code issue.

## Lessons Addressed
- No `.select('*')` — all queries already use explicit columns, will maintain that.
- All queries have `.limit()` — will maintain, bumping messages to 200 for full-day capture.
- No `console.log` — server-side logging uses `process.stderr.write`.

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #182

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
