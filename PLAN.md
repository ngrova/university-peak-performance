# Plan: Restructure Goals — Rename, Split, and Reparent

## Task
Rename 7 existing goals to shorter actionable names, add 7 new goals split from originals, and move some goals to different pillars. Data cleanup only — no schema changes.

## Approach
- Write a Supabase migration SQL file using title-based lookups (no hardcoded UUIDs)
- Renames: UPDATE goals SET title, description WHERE title matches old name
- New goals: INSERT using subqueries to resolve pillar_id by pillar name
- Moves: UPDATE goals SET pillar_id using subquery on target pillar name

## Files to Change
- None (existing code unchanged)

## New Files
- `apps/thriving/supabase/migrations/20260320000001_restructure_goals.sql`

## Scope
small (1 new file)

## STATUS: APPROVED
