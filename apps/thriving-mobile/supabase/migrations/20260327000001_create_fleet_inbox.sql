-- Fleet Inbox: lightweight per-agent notification rows
-- so agents can check for new posts without a full sync.

CREATE TABLE fleet_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES fleet_messages(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread'
    CHECK (status IN ('unread', 'read', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partial index: only unread rows per agent — keeps check_inbox fast
CREATE INDEX idx_fleet_inbox_unread
  ON fleet_inbox (agent_id, status)
  WHERE status = 'unread';
