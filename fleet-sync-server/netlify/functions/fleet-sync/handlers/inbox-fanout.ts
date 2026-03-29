// ═══════════════════════════════════════════════════════════
// FILE: inbox-fanout.ts
// PURPOSE: Creates inbox notification rows when a message is
//   posted. Routes to specific agent or broadcasts to all
//   registered agents. Supports notify_self for relay wake-ups.
// CALLED BY: handlers/post.ts, handlers/batch-post.ts
// DATA FLOW: post_id + agent_id + to_agent + notifySelf →
//   query fleet_agents → insert fleet_inbox rows → return count.
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
 * row per registered agent. When notifySelf is true, the sender
 * is included in recipients (for relay wake-ups).
 *
 * Errors are caught and returned as warnings — a fanout
 * failure must never fail the post itself.
 */
export async function fanoutInbox(
  db: SupabaseClient,
  postId: string,
  senderAgentId: string,
  toAgent: string | null | undefined,
  notifySelf = false
): Promise<{ delivered: number; warning?: string }> {
  try {
    const recipients = await resolveRecipients(db, senderAgentId, toAgent, notifySelf)
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
 * all registered agents. When notifySelf is true, the sender
 * is included in the recipient list.
 */
async function resolveRecipients(
  db: SupabaseClient,
  senderAgentId: string,
  toAgent: string | null | undefined,
  notifySelf: boolean
): Promise<string[]> {
  if (!isBroadcast(toAgent)) {
    // Directed message — single recipient
    if (toAgent === senderAgentId) return notifySelf ? [toAgent!] : []
    return [toAgent!]
  }

  // Broadcast — all registered agents (optionally including sender)
  let query = db.from('fleet_agents').select('agent_id').limit(50)
  if (!notifySelf) query = query.neq('agent_id', senderAgentId)

  const { data, error } = await query
  if (error) throw new Error(`Failed to query agents — ${error.message}`)
  return (data ?? []).map((row) => row.agent_id as string)
}

/**
 * Runs inbox fanout for each created post in a batch result set.
 * Called by handleBatchPost after the bulk insert succeeds.
 * Collects warnings from individual fanouts into an array.
 */
export async function fanoutBatchResults(
  db: SupabaseClient,
  results: Array<{ post_id: string; status: string }>,
  posts: Array<{ to_agent?: string; notify_self?: boolean }>,
  agentId: string
): Promise<string[]> {
  const warnings: string[] = []
  for (let i = 0; i < results.length; i++) {
    if (results[i].status !== 'created' || !results[i].post_id) continue
    const inbox = await fanoutInbox(
      db, results[i].post_id, agentId,
      posts[i]?.to_agent, posts[i]?.notify_self ?? false
    )
    if (inbox.warning) warnings.push(inbox.warning)
  }
  return warnings
}
