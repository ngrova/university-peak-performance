# Plan: Fleet Sync Dashboard

## TYPE
FEATURE

## Task
Build a web dashboard at fleet-sync-upp.netlify.app so Nick and Erin can see what the AI fleet is doing — agents, messages, decisions, open items — without opening a chat. Title: "Nick & Erin's AI Fleet". Dark command-center aesthetic.

## Approach
1. Create the dashboard API as a Netlify function split across multiple files for Sandi Metz compliance:
   - `fleet-sync-server/netlify/functions/fleet-dashboard/index.ts` — entry point handler (<25 lines), validates request, calls fetchDashboardData, returns JSON with CORS headers
   - `fleet-sync-server/netlify/functions/fleet-dashboard/queries.ts` — single exported `fetchAllData()` function (<25 lines) that calls 4 private query helpers (each <25 lines) and returns the combined result
   - `fleet-sync-server/netlify/functions/fleet-dashboard/stats.ts` — computeStats helper (<25 lines) that derives counts from query results
2. Create `fleet-sync-server/index.html` — a static single-page dashboard using pure HTML/CSS/JS (no framework, no build step) that fetches from the API and renders the command-center UI
3. Update `fleet-sync-server/netlify.toml` to set `publish = "."` so Netlify serves the index.html as the site root, and add config for the new function

### Dashboard API design
- Single endpoint: `GET /.netlify/functions/fleet-dashboard`
- Auth: optional FLEET_API_KEY check (same pattern as fleet-sync auth.ts) — if FLEET_API_KEY env var is set, require Bearer token; if unset, allow all requests
- Queries (all with explicit columns and .limit()):
  - fleet_agents: ordered by last_synced_at desc, .limit(50)
  - fleet_messages: ordered by created_at desc, .limit(50)
  - fleet_decisions: status = 'active', ordered by created_at desc, .limit(50)
  - fleet_messages where resolution_status = 'open': ordered by created_at desc, .limit(50)
- Computes stats: active_agents count, planned_agents count, messages_today count, open_items count, active_decisions count
- CORS: Access-Control-Allow-Origin set to the fleet-sync-upp.netlify.app domain (not wildcard *)
- Error handling: if any Supabase query returns an error, the API returns HTTP 500 with `{ error: "Failed to load fleet data" }` — never returns empty arrays on error

### Dashboard error handling design
- API returns 500 + `{ error: string }` if any query fails — never empty arrays
- Dashboard checks `response.ok` before rendering; on failure, shows a visible error banner ("Failed to load fleet data — retrying...")
- Auto-refresh failures update a visible "last updated X seconds ago" indicator and show a warning dot
- Stale data is never shown without an indicator that refresh has failed

### Dashboard UI design
- Dark theme: deep navy/midnight backgrounds (#0a0e1a, #111827, #1a1f36)
- Primary color: blue (#3b82f6 and variants)
- Typography: JetBrains Mono (Google Fonts) for data, Inter for UI text
- KPI cards at top with live counts
- Agent cards in a grid — active agents bright, planned agents dimmed
- Activity feed with color-coded kind badges (progress=blue, decision=purple, recommendation=amber, blocker=red, insight=teal, etc.)
- Open items panel with urgency badges (now=red, this-week=amber, when-ready=gray)
- Decision log with domain badges and acknowledgment counts
- Auto-refresh every 30 seconds with visual indicator
- Subtle pulse animation on "systems online" status indicator

## Files to Change
- `fleet-sync-server/netlify.toml` — add `publish = "."` and fleet-dashboard function config

## New Files
- `fleet-sync-server/netlify/functions/fleet-dashboard/index.ts` — entry point handler, CORS, auth check
- `fleet-sync-server/netlify/functions/fleet-dashboard/queries.ts` — single fetchAllData export with 4 private query helpers
- `fleet-sync-server/netlify/functions/fleet-dashboard/stats.ts` — stat computation helper
- `fleet-sync-server/index.html` — static dashboard page (HTML/CSS/JS, no framework)

## Scope
medium

## Pushback
None — proceeding as specified. This is a clean addition to the fleet-sync-server project. The dashboard API reuses the same Supabase client pattern as the existing MCP server. The static HTML approach avoids any build complexity. No changes to the existing fleet-sync function.

## Lessons Addressed
- `.select('*')` prohibition: all Supabase queries will list explicit columns
- `.limit()` requirement: all list queries will have explicit limits
- No console.log: the dashboard API will use structured error responses, no console logging
- Pipeline is non-negotiable: following full pipeline for this feature

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
