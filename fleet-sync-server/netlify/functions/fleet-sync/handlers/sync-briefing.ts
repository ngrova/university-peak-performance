// ═══════════════════════════════════════════════════════════
// FILE: sync-briefing.ts
// PURPOSE: Data-fetching queries for the sync briefing —
//   recent messages, open items directed to this agent, and
//   unacknowledged decisions.
// CALLED BY: handlers/sync.ts
// DATA FLOW: Supabase client + agent_id → query fleet tables
//   → return arrays for the briefing response.
// ═══════════════════════════════════════════════════════════

import { SupabaseClient } from '@supabase/supabase-js'

/** Fetches the 30 most recent messages since last sync. */
export async function fetchRecentMessages(db: SupabaseClient, since: string | null) {
  let query = db
    .from('fleet_messages')
    .select('id, agent_id, kind, thread_id, summary, body, tags, to_agent, urgency, relay_type, chain_id, depth, reply_to, notify_self, created_at')
    .order('created_at', { ascending: false })
    .limit(30)

  if (since) query = query.gte('created_at', since)

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch messages — ${error.message}`)

  // Truncate body to 500 chars for briefing
  return (data ?? []).map((m) => ({
    ...m,
    body: m.body && m.body.length > 500 ? m.body.slice(0, 500) + '…' : m.body,
  }))
}

/** Fetches open items directed to this agent or the whole fleet. */
export async function fetchOpenItems(db: SupabaseClient, agentId: string) {
  const { data, error } = await db
    .from('fleet_messages')
    .select('id, agent_id, kind, summary, body, to_agent, urgency, thread_id, relay_type, chain_id, depth, reply_to, created_at')
    .eq('resolution_status', 'open')
    .in('to_agent', [agentId, 'fleet'])
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) throw new Error(`Failed to fetch open items — ${error.message}`)
  return data ?? []
}

/** Fetches active decisions this agent hasn't acknowledged. */
export async function fetchUnackedDecisions(db: SupabaseClient, agentId: string) {
  const { data, error } = await db
    .from('fleet_decisions')
    .select('id, decision, reasoning, decided_by, domain, affects_agents, status, created_at')
    .eq('status', 'active')
    .not('acknowledged_by', 'cs', `{${agentId}}`)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) throw new Error(`Failed to fetch decisions — ${error.message}`)
  return data ?? []
}
