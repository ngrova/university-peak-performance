# Plan: Fleet Sync v1.1 — Document Storage + Batch Post

## TYPE
FEATURE

## Task
Add document storage system (100K char limit) and batch post tool to fleet-sync-server. AIs need to share documents larger than the 4000-char message body limit — project instructions, architecture specs, prompts. Also add batch_post to reduce round-trips for multi-message operations.

## Approach
1. Extract shared post validation into post-validation.ts module
2. Build 4 new handlers: save-document, list-documents, get-document, batch-post
3. Wire 4 new tool definitions into tools.ts and router.ts
4. Update rate-limiter.ts with count parameter for batch writes
5. Add documents section to fleet dashboard (queries, stats, UI)
6. Create SQL migration for fleet_documents table

## Files to Change
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/post.ts` — import from shared validation module
- `fleet-sync-server/netlify/functions/fleet-sync/tools.ts` — add 4 new tool definitions
- `fleet-sync-server/netlify/functions/fleet-sync/router.ts` — add imports, dispatch cases, batch rate limit logic, version bump
- `fleet-sync-server/netlify/functions/fleet-sync/rate-limiter.ts` — add count parameter to checkRateLimit
- `fleet-sync-server/netlify/functions/fleet-dashboard/queries.ts` — add fetchDocuments, update fetchAllData
- `fleet-sync-server/netlify/functions/fleet-dashboard/stats.ts` — add total_documents stat
- `fleet-sync-server/netlify/functions/fleet-dashboard/index.ts` — pass documents to computeStats, include in response
- `fleet-sync-server/index.html` — add Documents KPI card and Recent Documents sidebar panel

## New Files
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/post-validation.ts` — shared VALID_KINDS, DIRECTED_KINDS, validatePost()
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/save-document.ts` — save_document handler
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/list-documents.ts` — list_documents handler
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/get-document.ts` — get_document handler
- `fleet-sync-server/netlify/functions/fleet-sync/handlers/batch-post.ts` — batch_post handler
- `fleet-sync-server/migrations/002_fleet_documents.sql` — database migration

## Scope
medium

## Pushback
None — proceeding as specified. 4 tools is correct (list/get split matches existing read_decisions/read_post pattern).

## Lessons Addressed
None applicable to this task.

## 9-AGENT PLAN REVIEW: Have all 9 review agents reviewed and approved this plan?
RESULT: PASS

## PUSHBACK RESOLVED: If pushback was declared above, has the human acknowledged it?
N/A — no pushback declared.

## HUMAN APPROVAL: Has the human reviewed this plan and confirmed "build it"?
STATUS: CONFIRMED

## COUNCIL CODE REVIEW (local, advisory): Have all 9 agents reviewed the code diff?
RESULT: PENDING
