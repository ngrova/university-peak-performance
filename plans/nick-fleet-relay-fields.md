# Plan: Fleet Relay System Fields

## TYPE
FEATURE

## Task
Add relay system columns to fleet_messages and update all Fleet Sync server handlers to accept, store, and return them. This enables autonomous agent-to-agent wake-up via four relay types (board_post, desk_drop, office_visit, reply) with chain depth tracking and self-notification.

## Approach

### 1. Migration — `20260328000001_add_relay_fields.sql`
Add 5 columns to fleet_messages via ALTER TABLE (all backward-compatible):
- `relay_type TEXT CHECK (relay_type IN ('board_post', 'desk_drop', 'office_visit', 'reply'))` — nullable
- `chain_id UUID` — nullable
- `depth INTEGER DEFAULT 0 CHECK (depth >= 0 AND depth <= 6)` — nullable with default
- `reply_to UUID REFERENCES fleet_messages(id) ON DELETE SET NULL` — nullable FK
- `notify_self BOOLEAN DEFAULT false` — nullable with default

Add index: `idx_messages_chain ON fleet_messages(chain_id) WHERE chain_id IS NOT NULL`

### 2. Sandi Metz refactoring (pre-requisite)

batch-post.ts is already ~129 code lines (limit: 100) with functions over 25 lines. tools.ts is ~103 code lines. Adding relay fields without refactoring would worsen both violations.

**batch-post.ts** — Extract `buildBatchRows` into new file `batch-rows.ts`. Extract the fanout loop + summary assembly (lines 138-155) into `fanoutBatchResults` in `inbox-fanout.ts`. This reduces `handleBatchPost` to orchestration only and brings both files under limits.

**tools.ts** — Extract post + batch_post tool schema definitions into new file `tools-post.ts`. Import and spread them back into the TOOLS array in tools.ts. This brings tools.ts under 100 code lines and isolates the schemas being modified.

### 3. Server handler updates

**post.ts** — Add relay fields to PostArgs interface and insert object. Pass notify_self to fanoutInbox.

**batch-rows.ts** (new, extracted from batch-post.ts) — Add relay fields to PostItem interface and row-building logic.

**batch-post.ts** — Import from batch-rows.ts. Pass per-post notify_self to fanoutBatchResults.

**inbox-fanout.ts** — Add notifySelf parameter to `fanoutInbox`. When true, include sender in recipients. Add `fanoutBatchResults` export for batch post fanout loop.

**sync-briefing.ts** — Add `relay_type, chain_id, depth, reply_to, notify_self` to fetchRecentMessages select. Add `relay_type, chain_id, depth, reply_to` to fetchOpenItems select.

**check-inbox.ts** — Add `relay_type` to ENVELOPE_COLUMNS join. Include in reshaped items.

**read-post.ts** — Add `relay_type, chain_id, depth, reply_to, notify_self` to POST_COLUMNS.

**post-validation.ts** — Add server-side validation for relay_type enum and depth range (0-6). DB CHECK is authoritative; server validation is UX.

**tools-post.ts** (new, extracted from tools.ts) — Post and batch_post tool schema definitions with relay fields added.

**tools.ts** — Import post/batch_post schemas from tools-post.ts.

**post-validation.test.ts** — Add test cases for: valid relay_type values, invalid relay_type, depth in range, depth out of range (negative and >6), null/omitted relay fields passing validation.

### 4. No changes needed
- respond.ts — resolves open items, no relay fields needed
- update-inbox.ts — status changes only
- RLS policies — none exist (service_role bypasses)

## Files to Change
- `apps/thriving-mobile/supabase/migrations/20260328000001_add_relay_fields.sql` — new migration
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/post.ts` — accept + store relay fields
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/batch-post.ts` — slim down, import from batch-rows, use fanoutBatchResults
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/inbox-fanout.ts` — notify_self support + fanoutBatchResults export
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/sync-briefing.ts` — return relay fields
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/check-inbox.ts` — return relay_type in envelope
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/read-post.ts` — return relay fields
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/post-validation.ts` — validate relay fields
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/post-validation.test.ts` — test relay validation
- `fleet-sync-server/netlify/functions/fleet-sync/tools.ts` — import post schemas from tools-post.ts

## New Files
- `apps/thriving-mobile/supabase/migrations/20260328000001_add_relay_fields.sql` — relay columns + index
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/batch-rows.ts` — extracted from batch-post.ts (buildBatchRows + types)
- `fleet-sync-server/netlify/functions/fleet-sync/tools-post.ts` — extracted post + batch_post tool schemas with relay fields

## Scope
medium

## Pushback
Three items raised and accepted by Nick:
1. Added CHECK (depth >= 0 AND depth <= 6) — enforces max 6 hops at DB level per coding standards
2. Made reply_to a real FK with ON DELETE SET NULL — prevents orphaned chains
3. Storing notify_self as a column — enables debugging/auditing

## Lessons Addressed
- .select('*') violation: All queries use explicit column lists — relay fields added to each select individually
- Missing .limit(): All existing queries already have limits; no new unbounded queries introduced
- Console.log: No console.log in any handler — errors thrown with actionable messages

## COUNCIL PLAN REVIEW: Have all review agents reviewed and approved this plan?
RESULT: PASS
COUNCIL_PLAN_REVIEW: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
ACKNOWLEDGED — Nick confirmed all three pushback items (2026-03-28).

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all review agents reviewed the code diff?
RESULT: PASS
COUNCIL_CODE_REVIEW: PASS
