// ═══════════════════════════════════════════════════════════
// FILE: update-inbox.ts
// PURPOSE: Handles the "update_inbox" tool — marks an inbox
//   row as read or dismissed so it no longer appears in
//   check_inbox results.
// CALLED BY: router.ts (when tools/call name = "update_inbox")
// DATA FLOW: agent_id + post_id + status → update fleet_inbox
//   WHERE unread → return updated boolean.
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../db'
import { withMeta } from '../meta'
import { requireString, checkEnum } from '../validation'

const VALID_STATUSES = ['read', 'dismissed'] as const

// UUID v4 format check
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface UpdateInboxArgs {
  agent_id: string
  post_id: string
  status: string
}

/**
 * Marks an inbox row as read or dismissed. Called by agents
 * after they have seen or acted on an inbox notification.
 * Only updates rows with status 'unread' — already-read rows
 * are silently skipped (returns updated: false).
 */
export async function handleUpdateInbox(args: UpdateInboxArgs) {
  const db = getFleetClient()

  const err = requireString(args.agent_id, 'agent_id')
    ?? requireString(args.post_id, 'post_id')
    ?? requireString(args.status, 'status')
    ?? checkEnum(args.status, 'status', VALID_STATUSES)
  if (err) throw new Error(err)

  if (!UUID_RE.test(args.post_id)) {
    throw new Error('post_id must be a valid UUID')
  }

  const { data, error } = await db
    .from('fleet_inbox')
    .update({ status: args.status })
    .eq('agent_id', args.agent_id)
    .eq('post_id', args.post_id)
    .eq('status', 'unread')
    .select('id')
    .limit(1)

  if (error) throw new Error(`Failed to update inbox — ${error.message}`)

  return withMeta({ updated: (data ?? []).length > 0 })
}
