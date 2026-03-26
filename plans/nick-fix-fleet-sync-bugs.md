# Plan: Fix Fleet Sync Handler Bugs

## TYPE
FEATURE

## Task
Fix two high-priority bugs in the fleet-sync MCP server (fleet-sync-upp.netlify.app):
1. Sync handler returns empty recent_messages and missing open_items
2. Posts with body content intermittently fail with a generic error before reaching the database

## Approach

### Bug 1a: recent_messages empty (user-reported, root-cause confirmed)
The post handler (post.ts:101) updates `last_synced_at` on every post. When the agent later syncs, `fetchPreviousSyncTime` returns the time of the last POST instead of the last sync. `fetchRecentMessages` then filters with `.gte('created_at', lastPostTime)` — missing messages between the actual last sync and the last post. Example: agent syncs at T0, posts at T5. Next sync reads prevSync=T5 and misses all messages between T0-T5 from other agents. Fix: change post handler to update `updated_at` instead of `last_synced_at`. The `updated_at` column already exists (set by `upsertAgent`). The `upsertAgent` timing in sync.ts is correct — `prevSync` is captured at line 37 before `upsertAgent` runs at line 39, so the briefing uses the old value.

### Bug 1a dashboard impact
Dashboard queries.ts orders agents by `last_synced_at` and stats.ts uses `last_synced_at` for "active" agent count. After fixing post.ts to only update `updated_at`, agents that post but haven't synced recently would appear stale. Fix: switch both to `updated_at`, which reflects any activity (sync or post).

### Bug 1b: open_items missing directed recommendations
Confirmed `fetchOpenItems` does NOT filter by `created_at`. The `.or()` string interpolation filter is structurally correct but fragile — replace with `.in('to_agent', [agentId, 'fleet'])` which properly parameterizes values and avoids PostgREST filter syntax issues.

### Bug 2: Posts with body failing
Three defensive gaps: (1) Missing Base64 body decoding — Netlify/Lambda can set `isBase64Encoded=true` for larger payloads, causing JSON.parse to fail on the Base64 string. Decode conditionally only when `isBase64Encoded` is true. (2) No top-level try/catch in handler — unhandled throws crash the function with a Netlify 500. (3) No body type validation — truthy non-string body passes validation but fails unpredictably at Supabase. Also: rate limiter call in router.ts is outside the try/catch.

### Line counts (code lines only, per Sandi Metz — comments and blanks excluded)
- post.ts: 79 code lines (+2 for body validation = 81). Under 100.
- router.ts: 91 code lines (restructure only, no net change). Under 100.
- index.ts: ~72 code lines (+8 for Base64 + try/catch = ~80). Under 100.
- All other files: line swaps only, no growth.

## Files to Change
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/post.ts` — Change `last_synced_at` update to `updated_at`; add body type validation
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/sync-briefing.ts` — Replace `.or()` with `.in()` in fetchOpenItems
- `fleet-sync-server/netlify/functions/fleet-sync/index.ts` — Add isBase64Encoded handling; add top-level try/catch
- `fleet-sync-server/netlify/functions/fleet-sync/router.ts` — Move rate limiter inside try/catch
- `fleet-sync-server/netlify/functions/fleet-dashboard/queries.ts` — Order agents by `updated_at`
- `fleet-sync-server/netlify/functions/fleet-dashboard/stats.ts` — Use `updated_at` for active agent check

## New Files
None.

## Scope
medium

## Pushback
None — proceeding as specified.

## Lessons Addressed
- No `.select('*')` used — all queries already use explicit columns
- All queries already have `.limit()` — no unbounded fetches
- No console.log — errors thrown with actionable messages

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #176

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
