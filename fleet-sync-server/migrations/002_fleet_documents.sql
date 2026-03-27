-- Fleet Sync v1.1: Document storage for sharing large content between agents.
-- Run manually via Supabase SQL editor (supabase db push).

CREATE TABLE fleet_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  agent_id TEXT NOT NULL REFERENCES fleet_agents(agent_id),
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 500),
  tags TEXT[] DEFAULT '{}',
  file_type TEXT NOT NULL DEFAULT 'text/markdown',
  content TEXT CHECK (char_length(content) <= 100000),
  for_agents TEXT[] DEFAULT '{}',
  thread_id UUID,
  schema_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fleet_documents_agent_id ON fleet_documents(agent_id);
CREATE INDEX idx_fleet_documents_tags ON fleet_documents USING GIN(tags);
CREATE INDEX idx_fleet_documents_for_agents ON fleet_documents USING GIN(for_agents);
CREATE INDEX idx_fleet_documents_created_at ON fleet_documents(created_at DESC);

-- RLS: fleet-sync handlers use service_role (bypasses RLS),
-- but RLS is enabled as defense-in-depth. No anon/authenticated
-- policies are defined because this table is only accessed via
-- the fleet-sync serverless function, never from client-side code.
ALTER TABLE fleet_documents ENABLE ROW LEVEL SECURITY;
