# Plan: Deploy fleet-sync as a Separate Netlify Site

## TYPE
REDESIGN

## Task
After 6 failed PRs trying to make the fleet-sync Netlify function coexist with the Next.js plugin (which intercepts all routes at the infrastructure level), extract fleet-sync into its own standalone project at `fleet-sync-server/`. This project will be deployed as a separate Netlify site with its own URL (e.g., fleet-sync-upp.netlify.app), completely avoiding the Next.js plugin conflict.

## Approach
1. Create `fleet-sync-server/` directory at repo root
2. Create a standalone `package.json` with only `@supabase/supabase-js` as a dependency
3. Create a minimal `netlify.toml` with just function config (esbuild bundler, no Next.js plugin)
4. Copy all 21 fleet-sync function files into `fleet-sync-server/netlify/functions/fleet-sync/` preserving the exact directory structure (handlers/ subdirectory)
5. Remove `.ts` extensions from all imports — standard Node.js esbuild bundling doesn't need them (they were added for the Deno edge runtime attempt which we're abandoning)
6. Delete the old `netlify/functions/fleet-sync/` directory
7. Remove the `[functions."fleet-sync"]` block and `functions = "netlify/functions"` line from the root `netlify.toml`
8. Add a `.gitignore` in `fleet-sync-server/` for `node_modules/`

## Files to Change
- `netlify.toml` — remove fleet-sync function config and functions directory reference

## New Files
- `fleet-sync-server/package.json` — standalone package with supabase dependency
- `fleet-sync-server/netlify.toml` — minimal function config
- `fleet-sync-server/.gitignore` — ignore node_modules
- `fleet-sync-server/netlify/functions/fleet-sync/index.ts` — entry point (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/auth.ts` — auth module (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/auth.test.ts` — auth tests (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/db.ts` — supabase client (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/meta.ts` — meta injection (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/meta.test.ts` — meta tests (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/rate-limiter.ts` — rate limiter (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/rate-limiter.test.ts` — rate limiter tests (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/router.ts` — MCP router (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/tools.ts` — tool definitions (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/validation.ts` — input validation (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/validation.test.ts` — validation tests (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/sync.ts` — sync handler (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/sync-queries.ts` — sync queries (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/sync-briefing.ts` — sync briefing (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/post.ts` — post handler (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/respond.ts` — respond handler (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/record-decision.ts` — record decision (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/read-decisions.ts` — read decisions (copied)
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/read-post.ts` — read post (copied)

## Files to Delete
- `netlify/functions/fleet-sync/index.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/auth.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/auth.test.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/db.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/meta.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/meta.test.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/rate-limiter.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/rate-limiter.test.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/router.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/tools.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/validation.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/validation.test.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/package.json` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/handlers/sync.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/handlers/sync-queries.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/handlers/sync-briefing.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/handlers/post.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/handlers/respond.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/handlers/record-decision.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/handlers/read-decisions.ts` — moved to fleet-sync-server
- `netlify/functions/fleet-sync/handlers/read-post.ts` — moved to fleet-sync-server

## Scope
small

## Deployment Notes (operational, not code)
- **Runtime:** Netlify Functions defaults to Node.js. The new `netlify.toml` specifies `node_bundler = "esbuild"` explicitly.
- **Env vars:** Nick creates the new Netlify site and configures SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and FLEET_API_KEY in the Netlify dashboard. Same values as the main site.
- **DNS/routing:** Fleet-sync is an MCP server called directly by Claude clients via its own URL. It is NOT called by the main thriving-mobile app. No routing integration or redirect needed. The function currently doesn't work at all (6 failed PRs), so there is no traffic to transition.
- **RLS:** Fleet-sync uses service_role key, which bypasses RLS entirely. No RLS changes needed.
- **Verification:** Standard pipeline step 17 (deploy monitoring) — after merge, confirm Netlify deploy of the new site succeeds and the function responds to a test POST.

## Pushback
None — proceeding as specified. After 6 PRs fighting the Next.js plugin, a separate site is the clean architectural solution. The function code is unchanged — it's purely a deployment topology change.

## Lessons Addressed
- 2026-03-22: Pipeline is non-negotiable even for small fixes — following full pipeline for this move.

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #173

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
