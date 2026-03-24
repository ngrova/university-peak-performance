# Plan: Task media attachments — PR 1/3: Database infrastructure

## TYPE
FEATURE

## Task
Permanent media attachments on tasks. PR 1 creates the Storage bucket, task_attachments table, delegation-aware RLS policies, @upp/db query functions, and server actions for upload/fetch/delete.

## Approach
- Create migration: task_attachments table with delegation-aware RLS (same EXISTS pattern as tasks/goals/pillars)
- Create migration: task-media Storage bucket with authenticated upload/download policies
- Add @upp/db attachment query functions (getTaskAttachments, createAttachment, deleteAttachment) with explicit columns and .limit()
- Add server actions (uploadAttachment, fetchAttachments, deleteAttachment) following existing patterns
- Apply migrations to remote database via Management API

## New Files
- `apps/thriving/supabase/migrations/20260323000001_create_task_attachments.sql` — table + RLS
- `apps/thriving/supabase/migrations/20260323000002_create_task_media_bucket.sql` — Storage bucket + policies
- `packages/db/attachments.ts` — DB query functions
- `apps/thriving-mobile/src/actions/attachment-actions.ts` — server actions

## Files to Change
- `packages/db/index.ts` — export new attachment functions and types

## Scope
medium (4 new files, 1 updated)

## STATUS: COMPLETED
