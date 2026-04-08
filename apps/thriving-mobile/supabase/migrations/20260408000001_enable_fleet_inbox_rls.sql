-- Enable RLS on fleet_inbox to match fleet_agents, fleet_messages, fleet_decisions.
-- Pattern: RLS enabled, no policies — service_role bypasses, anon gets zero rows.
-- Resolves Supabase security alert rls_disabled_in_public (April 7, 2026).

ALTER TABLE fleet_inbox ENABLE ROW LEVEL SECURITY;
