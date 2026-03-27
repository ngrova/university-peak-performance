// ═══════════════════════════════════════════════════════════
// FILE: queries.ts
// PURPOSE: Fetches all fleet data for the dashboard, filtered
//   by date in Eastern Time. Returns agents, messages, decisions,
//   and open items from the fleet Supabase tables.
// CALLED BY: index.ts (the dashboard API entry point)
// DATA FLOW: date param → Eastern day bounds → Supabase queries
//   → combined result object for JSON response.
// ═══════════════════════════════════════════════════════════

import { SupabaseClient } from '@supabase/supabase-js'

interface FleetData {
  agents: Record<string, unknown>[]
  messages: Record<string, unknown>[]
  decisions: Record<string, unknown>[]
  openItems: Record<string, unknown>[]
}

/** Computes UTC start/end bounds for an Eastern Time day. */
export function getEasternDayBounds(dateParam?: string) {
  // Default to today in America/New_York
  const todayET = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
  }).format(new Date())
  const dateStr = dateParam || todayET
  // Probe noon UTC to determine EDT vs EST offset
  const probe = new Date(`${dateStr}T12:00:00Z`)
  const etHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false,
    }).format(probe),
    10
  )
  const offsetH = 12 - etHour // 4 = EDT, 5 = EST
  const [y, m, d] = dateStr.split('-').map(Number)
  const start = new Date(Date.UTC(y, m - 1, d, offsetH)).toISOString()
  const end = new Date(Date.UTC(y, m - 1, d + 1, offsetH) - 1).toISOString()
  return { start, end, dateStr }
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

/** Fetches fleet messages within a date range. */
async function fetchMessages(db: SupabaseClient, start: string, end: string) {
  const { data, error } = await db
    .from('fleet_messages')
    .select(
      'id, agent_id, kind, summary, body, tags, ' +
      'to_agent, urgency, thread_id, resolution_status, created_at'
    )
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw new Error(`messages query failed — ${error.message}`)
  return data ?? []
}

/** Fetches fleet decisions within a date range. */
async function fetchDecisions(db: SupabaseClient, start: string, end: string) {
  const { data, error } = await db
    .from('fleet_decisions')
    .select(
      'id, decision, reasoning, decided_by, domain, ' +
      'affects_agents, acknowledged_by, status, created_at'
    )
    .gte('created_at', start)
    .lte('created_at', end)
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
 * Fetches all dashboard data in parallel, filtered by date.
 * Messages and decisions use the date range. Agents and open
 * items always return current state (no date filter).
 */
export async function fetchAllData(
  db: SupabaseClient, start: string, end: string
): Promise<FleetData> {
  const [agents, messages, decisions, openItems] = await Promise.all([
    fetchAgents(db),
    fetchMessages(db, start, end),
    fetchDecisions(db, start, end),
    fetchOpenItems(db),
  ])
  return { agents, messages, decisions, openItems }
}
