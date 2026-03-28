# Plan: Fleet Inbox System

## TYPE
FEATURE

## Task
Build a lightweight inbox system for the Fleet Sync MCP server so agents can check for new posts with near-zero token cost. Currently agents go stale between interactions because full syncs cost 1,500-2,000 tokens each. The inbox gives agents a cheap way to see what's new without reading full post bodies.

## Approach
1. Create Supabase migration for `fleet_inbox` table with partial index on unread status
2. Add inbox row creation logic as a shared helper (used by both `post` and `batch_post` handlers)
3. Update `post` handler to call inbox helper after successful message insert
4. Update `batch_post` handler to call inbox helper for each created post
5. Create `check_inbox` handler — joins inbox with messages, returns envelope-only response
6. Create `update_inbox` handler — marks inbox rows as read/dismissed
7. Register both new tools in tools.ts and router.ts

## Files to Change
- `apps/thriving-mobile/supabase/migrations/20260327000001_create_fleet_inbox.sql` — new migration
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/post.ts` — add inbox row creation after insert
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/batch-post.ts` — add inbox row creation after bulk insert
- `fleet-sync-server/netlify/functions/fleet-sync/tools.ts` — register check_inbox and update_inbox tools
- `fleet-sync-server/netlify/functions/fleet-sync/router.ts` — add dispatch cases and imports

## New Files
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/inbox-fanout.ts` — shared helper that creates inbox rows for a given post (queries fleet_agents, inserts rows per routing logic)
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/check-inbox.ts` — check_inbox tool handler
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/update-inbox.ts` — update_inbox tool handler

## Scope
medium

## Pushback
None — proceeding as specified. Design observations documented in approach notes: application-layer fanout (as specified), broadcast token handles null/undefined/"all"/"fleet", partial index keeps check_inbox fast.

## Lessons Addressed
- **Explicit columns in Supabase queries:** All queries will list explicit columns — no `.select('*')`.
- **Pagination with .limit():** check_inbox will have `.limit(50)` default.
- **Never skip council review:** This PR goes through the full pipeline including both plan and code reviews.

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared. Observations documented but no blocking concerns.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: COMPLETED — PR #183

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
