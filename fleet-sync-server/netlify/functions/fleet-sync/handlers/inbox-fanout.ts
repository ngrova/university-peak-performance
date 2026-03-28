// ═══════════════════════════════════════════════════════════
// FILE: inbox-fanout.ts
// PURPOSE: Creates inbox notification rows when a message is
//   posted. Routes to specific agent or broadcasts to all
//   registered agents (excluding the sender).
// CALLED BY: handlers/post.ts, handlers/batch-post.ts
// DATA FLOW: post_id + agent_id + to_agent → query fleet_agents
//   if broadcast → insert fleet_inbox rows → return count.
// ═══════════════════════════════════════════════════════════

import { SupabaseClient } from '@supabase/supabase-js'

// Tokens that mean "send to everyone"
const BROADCAST_TOKENS = new Set(['all', 'fleet'])

/**
 * Determines if a to_agent value means broadcast (all agents).
 * Broadcast when null, undefined, or a known broadcast token.
 */
function isBroadcast(toAgent: string | null | undefined): boolean {
  if (!toAgent) return true
  return BROADCAST_TOKENS.has(toAgent)
}

/**
 * Creates inbox rows for a newly posted message. Called after
 * a successful insert into fleet_messages. If to_agent is a
 * specific agent, inserts one row. If broadcast, inserts one
 * row per registered agent (excluding the sender).
 *
 * Errors are caught and returned as warnings — a fanout
 * failure must never fail the post itself.
 */
export async function fanoutInbox(
  db: SupabaseClient,
  postId: string,
  senderAgentId: string,
  toAgent: string | null | undefined
): Promise<{ delivered: number; warning?: string }> {
  try {
    const recipients = await resolveRecipients(db, senderAgentId, toAgent)
    if (recipients.length === 0) return { delivered: 0 }

    const rows = recipients.map((agentId) => ({
      post_id: postId,
      agent_id: agentId,
      status: 'unread',
    }))

    const { error } = await db.from('fleet_inbox').insert(rows)
    if (error) return { delivered: 0, warning: `Inbox fanout failed — ${error.message}` }

    return { delivered: recipients.length }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown inbox fanout error'
    return { delivered: 0, warning: msg }
  }
}

/**
 * Resolves the list of agent IDs that should receive an inbox
 * row. Directed messages go to one agent; broadcasts go to
 * all registered agents except the sender.
 */
async function resolveRecipients(
  db: SupabaseClient,
  senderAgentId: string,
  toAgent: string | null | undefined
): Promise<string[]> {
  if (!isBroadcast(toAgent)) {
    // Directed message — single recipient (skip if sender = recipient)
    return toAgent === senderAgentId ? [] : [toAgent!]
  }

  // Broadcast — all registered agents except sender
  const { data, error } = await db
    .from('fleet_agents')
    .select('agent_id')
    .neq('agent_id', senderAgentId)
    .limit(50)

  if (error) throw new Error(`Failed to query agents — ${error.message}`)
  return (data ?? []).map((row) => row.agent_id as string)
}
