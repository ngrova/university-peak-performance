-- Fleet Relay System: add relay routing fields to fleet_messages.
-- Enables agent-to-agent wake-up with chain depth tracking.
-- All columns nullable for backward compatibility.

ALTER TABLE fleet_messages
  ADD COLUMN relay_type TEXT
    CHECK (relay_type IN ('board_post', 'desk_drop', 'office_visit', 'reply')),
  ADD COLUMN chain_id UUID,
  ADD COLUMN depth INTEGER DEFAULT 0
    CHECK (depth >= 0 AND depth <= 6),
  ADD COLUMN reply_to UUID
    REFERENCES fleet_messages(id) ON DELETE SET NULL,
  ADD COLUMN notify_self BOOLEAN DEFAULT false;

-- Efficient chain lookups — partial index skips non-relay messages
CREATE INDEX idx_messages_chain
  ON fleet_messages(chain_id)
  WHERE chain_id IS NOT NULL;
