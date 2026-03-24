-- Enforce at most one is_one_thing=true task per user
CREATE UNIQUE INDEX tasks_one_thing_per_user
  ON tasks (user_id) WHERE is_one_thing = true;
