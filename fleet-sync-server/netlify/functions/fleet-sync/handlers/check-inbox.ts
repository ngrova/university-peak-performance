// ═══════════════════════════════════════════════════════════
// FILE: check-inbox.ts
// PURPOSE: Handles the "check_inbox" tool — returns unread
//   inbox items for an agent with envelope-only data (no post
//   body) for near-zero token cost.
// CALLED BY: router.ts (when tools/call name = "check_inbox")
// DATA FLOW: agent_id → join fleet_inbox + fleet_messages →
//   return summary envelope array.
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../db'
import { withMeta } from '../meta'
import { requireString } from '../validation'

interface CheckInboxArgs {
  agent_id: string
}

// Envelope columns — never include body
const ENVELOPE_COLUMNS =
  'fleet_messages!inner(id, agent_id, kind, summary, tags, urgency, created_at)'

/**
 * Returns unread inbox items for an agent. Called by agents at
 * the start of every prompt to cheaply check for new posts.
 * Joins fleet_inbox with fleet_messages to return envelope-only
 * data (summary, kind, tags — never the full body).
 */
export async function handleCheckInbox(args: CheckInboxArgs) {
  const db = getFleetClient()

  const err = requireString(args.agent_id, 'agent_id')
  if (err) throw new Error(err)

  const { data, error } = await db
    .from('fleet_inbox')
    .select(`post_id, ${ENVELOPE_COLUMNS}`)
    .eq('agent_id', args.agent_id)
    .eq('status', 'unread')
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) throw new Error(`Failed to check inbox — ${error.message}`)

  const rows = data ?? []
  if (rows.length === 0) return withMeta({ unread: 0 })

  // Reshape join result into flat envelope items
  const items = rows.map((row) => {
    const msg = row.fleet_messages as Record<string, unknown>
    return {
      post_id: row.post_id,
      from: msg.agent_id,
      kind: msg.kind,
      summary: msg.summary,
      tags: msg.tags,
      urgency: msg.urgency,
      created_at: msg.created_at,
    }
  })

  return withMeta({ unread: items.length, items })
}
