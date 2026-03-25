// ═══════════════════════════════════════════════════════════
// FILE: sync-queries.ts
// PURPOSE: Agent lifecycle queries for the sync handler —
//   fetch previous sync time, upsert agent record, and bump
//   the session counter.
// CALLED BY: handlers/sync.ts
// DATA FLOW: Supabase client + agent args → upsert/update →
//   return agent state for the sync orchestrator.
// ═══════════════════════════════════════════════════════════

import { SupabaseClient } from '@supabase/supabase-js'

/** Fetches the agent's last_synced_at before we update it. */
export async function fetchPreviousSyncTime(db: SupabaseClient, agentId: string) {
  // maybeSingle: returns null for new agents (not an error)
  const { data, error } = await db
    .from('fleet_agents')
    .select('last_synced_at')
    .eq('agent_id', agentId)
    .maybeSingle()
  if (error) throw new Error(`Failed to fetch sync time — ${error.message}`)
  return (data?.last_synced_at as string) ?? null
}

/** Creates or updates the agent record and sets sync timestamp. */
export async function upsertAgent(
  db: SupabaseClient,
  args: { agent_id: string; display_name: string; role: string; owner: string; domain: string },
  focus: string | undefined
) {
  const { error } = await db.from('fleet_agents').upsert(
    {
      agent_id: args.agent_id,
      display_name: args.display_name,
      role: args.role,
      owner: args.owner,
      domain: args.domain,
      current_focus: focus,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'agent_id' }
  )
  if (error) throw new Error(`Failed to upsert agent — ${error.message}`)
}

/** Atomically increments session_count via Postgres function. */
export async function bumpSessionCount(db: SupabaseClient, agentId: string) {
  const { error } = await db.rpc('fleet_increment_session', { p_agent_id: agentId })
  if (error) throw new Error(`Failed to increment session — ${error.message}`)
}
