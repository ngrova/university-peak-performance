-- Fleet Sync MCP Server — Database Schema
-- Date: 2026-03-25
-- Creates three tables for AI fleet communication:
--   fleet_agents    — Directory of AI agents
--   fleet_messages  — Unified communication stream
--   fleet_decisions — Permanent institutional memory
-- RLS enabled with no policies — service_role bypasses RLS,
-- anon key gets zero rows (defense-in-depth).

-- ═══════════════════════════════════════════════════════════
-- TABLE 1: fleet_agents
-- ═══════════════════════════════════════════════════════════

CREATE TABLE fleet_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  owner TEXT NOT NULL CHECK (owner IN ('nick', 'erin', 'both')),
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'planned', 'paused')),
  current_focus TEXT,
  last_synced_at TIMESTAMPTZ,
  session_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fleet_agents ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- TABLE 2: fleet_messages
-- ═══════════════════════════════════════════════════════════

CREATE TABLE fleet_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  agent_id TEXT NOT NULL REFERENCES fleet_agents(agent_id),
  kind TEXT NOT NULL CHECK (kind IN (
    'progress', 'decision', 'insight', 'context',
    'recommendation', 'question', 'warning',
    'blocker', 'blocker_resolved'
  )),
  thread_id UUID,
  summary TEXT NOT NULL CHECK (char_length(summary) <= 200),
  body TEXT CHECK (char_length(body) <= 4000),
  tags TEXT[] DEFAULT '{}',
  to_agent TEXT,
  urgency TEXT CHECK (urgency IN ('now', 'this-week', 'when-ready', 'fyi')),
  resolution_status TEXT CHECK (resolution_status IN ('open', 'accepted', 'rejected', 'discussed')),
  resolution_note TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  refs TEXT[] DEFAULT '{}',
  schema_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fleet_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_messages_agent ON fleet_messages(agent_id);
CREATE INDEX idx_messages_kind ON fleet_messages(kind);
CREATE INDEX idx_messages_created ON fleet_messages(created_at DESC);
CREATE INDEX idx_messages_thread ON fleet_messages(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX idx_messages_open ON fleet_messages(to_agent, resolution_status)
  WHERE resolution_status = 'open';
CREATE INDEX idx_messages_tags ON fleet_messages USING GIN(tags);

-- ═══════════════════════════════════════════════════════════
-- TABLE 3: fleet_decisions
-- ═══════════════════════════════════════════════════════════

CREATE TABLE fleet_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  decision TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  decided_by TEXT NOT NULL,
  domain TEXT NOT NULL,
  affects_agents TEXT[] DEFAULT '{}',
  acknowledged_by TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'reversed')),
  supersedes UUID REFERENCES fleet_decisions(id),
  superseded_by UUID REFERENCES fleet_decisions(id),
  source_thread_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fleet_decisions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_decisions_status ON fleet_decisions(status);
CREATE INDEX idx_decisions_domain ON fleet_decisions(domain);
CREATE INDEX idx_decisions_created ON fleet_decisions(created_at DESC);

-- ═══════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════

-- Atomically increment session_count for an agent
CREATE OR REPLACE FUNCTION fleet_increment_session(p_agent_id TEXT)
RETURNS void AS $$
  UPDATE fleet_agents
  SET session_count = session_count + 1
  WHERE agent_id = p_agent_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Append agent_id to acknowledged_by if not already present
CREATE OR REPLACE FUNCTION fleet_ack_decision(p_decision_id UUID, p_agent_id TEXT)
RETURNS void AS $$
  UPDATE fleet_decisions
  SET acknowledged_by = array_append(acknowledged_by, p_agent_id)
  WHERE id = p_decision_id
  AND NOT (p_agent_id = ANY(acknowledged_by));
$$ LANGUAGE sql SECURITY DEFINER;
