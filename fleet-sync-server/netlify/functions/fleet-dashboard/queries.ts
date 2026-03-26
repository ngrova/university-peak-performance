// ═══════════════════════════════════════════════════════════
// FILE: queries.ts
// PURPOSE: Fetches all fleet data for the dashboard in one
//   call — agents, messages, decisions, and open items from
//   the three fleet Supabase tables.
// CALLED BY: index.ts (the dashboard API entry point)
// DATA FLOW: Supabase client → 4 parallel queries → combined
//   result object returned to the handler for JSON response.
// ═══════════════════════════════════════════════════════════

import { SupabaseClient } from '@supabase/supabase-js'

interface FleetData {
  agents: Record<string, unknown>[]
  messages: Record<string, unknown>[]
  decisions: Record<string, unknown>[]
  openItems: Record<string, unknown>[]
}

/** Fetches all registered fleet agents, most recently synced first. */
async function fetchAgents(db: SupabaseClient) {
  const { data, error } = await db
    .from('fleet_agents')
    .select(
      'agent_id, display_name, role, owner, domain, ' +
      'current_focus, last_synced_at, session_count, updated_at'
    )
    .order('updated_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(`agents query failed — ${error.message}`)
  return data ?? []
}

/** Fetches the 50 most recent fleet messages. */
async function fetchMessages(db: SupabaseClient) {
  const { data, error } = await db
    .from('fleet_messages')
    .select(
      'id, agent_id, kind, summary, body, tags, ' +
      'to_agent, urgency, thread_id, resolution_status, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(`messages query failed — ${error.message}`)
  return data ?? []
}

/** Fetches active fleet decisions, most recent first. */
async function fetchDecisions(db: SupabaseClient) {
  const { data, error } = await db
    .from('fleet_decisions')
    .select(
      'id, decision, reasoning, decided_by, domain, ' +
      'affects_agents, acknowledged_by, status, created_at'
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(`decisions query failed — ${error.message}`)
  return data ?? []
}

/** Fetches open items (unresolved directed messages). */
async function fetchOpenItems(db: SupabaseClient) {
  const { data, error } = await db
    .from('fleet_messages')
    .select(
      'id, agent_id, kind, summary, to_agent, ' +
      'urgency, thread_id, created_at'
    )
    .eq('resolution_status', 'open')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(`open items query failed — ${error.message}`)
  return data ?? []
}

/**
 * Fetches all dashboard data in parallel from the three fleet
 * tables. Called by the handler on every dashboard API request.
 * Runs 4 queries concurrently and returns agents, messages,
 * decisions, and open items. Throws on any query failure so the
 * handler can return a 500 error instead of partial/empty data.
 */
export async function fetchAllData(db: SupabaseClient): Promise<FleetData> {
  const [agents, messages, decisions, openItems] = await Promise.all([
    fetchAgents(db),
    fetchMessages(db),
    fetchDecisions(db),
    fetchOpenItems(db),
  ])
  return { agents, messages, decisions, openItems }
}
