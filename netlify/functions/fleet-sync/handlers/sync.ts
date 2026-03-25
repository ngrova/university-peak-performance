// ═══════════════════════════════════════════════════════════
// FILE: sync.ts
// PURPOSE: Handles the "sync" tool — registers/updates an
//   agent, fetches a briefing of fleet activity, and
//   optionally wraps up a session with an auto-posted summary.
// CALLED BY: router.ts (when tools/call name = "sync")
// DATA FLOW: Agent args → upsert agent → fetch briefing →
//   optionally auto-post wrap_up → return structured briefing.
// ═══════════════════════════════════════════════════════════

import { SupabaseClient } from '@supabase/supabase-js'
import { getFleetClient } from '../db'
import { withMeta } from '../meta'
import { fetchPreviousSyncTime, upsertAgent, bumpSessionCount } from './sync-queries'
import { fetchRecentMessages, fetchOpenItems, fetchUnackedDecisions } from './sync-briefing'

interface SyncArgs {
  agent_id: string
  display_name: string
  role: string
  owner: string
  domain: string
  current_focus?: string
  wrap_up?: { current_focus: string; session_summary: string }
}

/**
 * Registers/updates this agent and assembles a briefing.
 * Called when an MCP client invokes the "sync" tool at the
 * start or end of a session. Fetches recent messages, open
 * items, and unacknowledged decisions. If wrap_up is present,
 * updates focus and auto-posts a progress message.
 */
export async function handleSync(args: SyncArgs) {
  const db = getFleetClient()
  const focus = args.wrap_up?.current_focus ?? args.current_focus
  const prevSync = await fetchPreviousSyncTime(db, args.agent_id)

  await upsertAgent(db, args, focus)
  await bumpSessionCount(db, args.agent_id)

  const [messages, openItems, decisions] = await Promise.all([
    fetchRecentMessages(db, prevSync),
    fetchOpenItems(db, args.agent_id),
    fetchUnackedDecisions(db, args.agent_id),
  ])

  if (args.wrap_up) {
    await postWrapUp(db, args.agent_id, args.wrap_up.session_summary)
  }

  await ackDecisions(db, args.agent_id, decisions)

  const daysSince = prevSync
    ? Math.round((Date.now() - new Date(prevSync).getTime()) / 86400000)
    : null

  return withMeta({
    agent_id: args.agent_id,
    days_since_last_sync: daysSince,
    recent_messages: messages,
    open_items: openItems,
    unacknowledged_decisions: decisions,
    wrap_up_posted: !!args.wrap_up,
  })
}

/** Appends agent_id to acknowledged_by on each decision. */
async function ackDecisions(db: SupabaseClient, agentId: string, decisions: Array<{ id: string }>) {
  for (const d of decisions) {
    const { error } = await db.rpc('fleet_ack_decision', {
      p_decision_id: d.id,
      p_agent_id: agentId,
    })
    if (error) throw new Error(`Failed to ack decision ${d.id} — ${error.message}`)
  }
}

/** Auto-posts a progress message when wrap_up is provided. */
async function postWrapUp(db: SupabaseClient, agentId: string, summary: string) {
  const truncated = summary.length > 200 ? summary.slice(0, 197) + '...' : summary
  const { error } = await db.from('fleet_messages').insert({
    agent_id: agentId,
    kind: 'progress',
    summary: truncated,
    body: summary.length > 200 ? summary : null,
    thread_id: crypto.randomUUID(),
  })
  if (error) throw new Error(`Failed to post wrap_up — ${error.message}`)
}
