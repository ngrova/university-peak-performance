# Plan: Fleet Sync MCP Server

## TYPE
FEATURE

## Task
Build a communication layer for the AI fleet — an MCP (Model Context Protocol) server deployed as a Netlify function, backed by Supabase. Multiple Claude projects connect to share context, decisions, and status updates. This is a standalone system that does not touch existing app code.

## Approach

1. **Database migration** — Create 3 tables (fleet_agents, fleet_messages, fleet_decisions) with indexes in a single migration file. RLS enabled on all 3 tables with no policies — service_role bypasses RLS automatically, but this closes the anon-key attack surface.

2. **Netlify Function scaffold** — Directory-based v2 function at `netlify/functions/fleet-sync/` with its own package.json (workspace package). Add to pnpm-workspace.yaml. Update netlify.toml ignore rule to include `netlify/`.

3. **MCP protocol layer** — Manual JSON-RPC 2.0 implementation (no SDK). Handles `initialize`, `notifications/initialized`, `tools/list`, `tools/call`, `ping`. Stateless — no sessions, no SSE.

4. **Authentication** — Bearer token validated against `FLEET_API_KEY` env var. 401 on missing/invalid.

5. **Rate limiting** — In-memory Map, 20 writes/agent/hour. Best-effort (resets on cold start).

6. **6 tool handlers:**
   - `sync` — Upsert agent, fetch briefing (recent messages, open items, unacknowledged decisions), update sync timestamp. Optional `wrap_up` parameter to update current_focus and auto-post a progress summary in one call.
   - `post` — Idempotency-safe write to fleet_messages with validation.
   - `respond` — Close open items (no double-responding).
   - `record_decision` — Idempotency-safe decision recording with supersedes chain.
   - `read_decisions` — Filtered query with defaults (status=active, limit=50).
   - `read_post` — Full post body + thread history.

7. **Every response includes `_meta`** injection warning field.

## Files to Change
- `pnpm-workspace.yaml` — add `'netlify/functions/*'`
- `netlify.toml` — add `netlify/` to ignore diff paths

## New Files
- `apps/thriving-mobile/supabase/migrations/20260325000001_create_fleet_tables.sql` — 3 tables + indexes
- `netlify/functions/fleet-sync/package.json` — workspace package
- `netlify/functions/fleet-sync/index.ts` — Thin entry point wiring auth, router, and response
- `netlify/functions/fleet-sync/router.ts` — JSON-RPC method dispatcher
- `netlify/functions/fleet-sync/rate-limiter.ts` — In-memory per-agent write throttle
- `netlify/functions/fleet-sync/tools.ts` — 6 tool definitions with input schemas
- `netlify/functions/fleet-sync/db.ts` — Supabase client initialization
- `netlify/functions/fleet-sync/auth.ts` — API key validation
- `netlify/functions/fleet-sync/meta.ts` — _meta field injection
- `netlify/functions/fleet-sync/validation.ts` — Input validation helpers
- `netlify/functions/fleet-sync/handlers/sync.ts` — Briefing assembly + wrap_up
- `netlify/functions/fleet-sync/handlers/sync-queries.ts` — Agent lifecycle queries (3 exports)
- `netlify/functions/fleet-sync/handlers/sync-briefing.ts` — Briefing data queries (3 exports)
- `netlify/functions/fleet-sync/handlers/post.ts` — Universal write
- `netlify/functions/fleet-sync/handlers/respond.ts` — Close open items
- `netlify/functions/fleet-sync/handlers/record-decision.ts` — Decision recording
- `netlify/functions/fleet-sync/handlers/read-decisions.ts` — Decision queries
- `netlify/functions/fleet-sync/handlers/read-post.ts` — Full post + thread retrieval

## Scope
large

## Pushback
None — proceeding as specified. Advisory notes:
- In-memory rate limiting resets on cold start (acknowledged in spec as acceptable)
- RLS enabled with no policies (defense-in-depth) — service_role bypasses RLS, anon key gets zero rows

## Lessons Addressed
- Never use .select('*') — all queries list explicit columns
- Always .limit() on list queries — default 50, max 30 for sync briefing
- Never use console.log in production — errors return structured JSON, no logging

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
