-- Allow tasks to exist without a goal ("unsorted" tasks).
-- Existing tasks all have goal_ids so no data change needed.
-- The FK constraint stays — non-null goal_ids still reference goals.
ALTER TABLE tasks ALTER COLUMN goal_id DROP NOT NULL;
