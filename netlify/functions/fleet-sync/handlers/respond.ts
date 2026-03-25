// ═══════════════════════════════════════════════════════════
// FILE: respond.ts
// PURPOSE: Handles the "respond" tool — resolves an open
//   item (question, recommendation, warning, blocker) by
//   setting its resolution status and note.
// CALLED BY: router.ts (when tools/call name = "respond")
// DATA FLOW: post_id + resolution args → find post → validate
//   not already resolved → update resolution fields → return.
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../db.ts'
import { withMeta } from '../meta.ts'
import { requireString, checkEnum } from '../validation.ts'

const VALID_STATUSES = ['accepted', 'rejected', 'discussed'] as const

interface RespondArgs {
  post_id: string
  resolution_status: string
  resolution_note: string
  resolved_by: string
}

/**
 * Resolves an open item by setting its resolution_status.
 * Called when an agent or human responds to a question,
 * recommendation, warning, or blocker. Prevents double-
 * responding by checking if already resolved. Updates the
 * post with resolution details and timestamp.
 */
export async function handleRespond(args: RespondArgs) {
  const db = getFleetClient()

  const err = requireString(args.post_id, 'post_id')
    ?? requireString(args.resolution_status, 'resolution_status')
    ?? requireString(args.resolution_note, 'resolution_note')
    ?? requireString(args.resolved_by, 'resolved_by')
    ?? checkEnum(args.resolution_status, 'resolution_status', VALID_STATUSES)
  if (err) throw new Error(err)

  // Find the post
  const { data: post, error: findErr } = await db
    .from('fleet_messages')
    .select('id, resolution_status, thread_id')
    .eq('id', args.post_id)
    .single()

  if (findErr || !post) throw new Error('Post not found')
  if (post.resolution_status && post.resolution_status !== 'open') {
    throw new Error(`Post already resolved as "${post.resolution_status}"`)
  }

  const { error: updateErr } = await db
    .from('fleet_messages')
    .update({
      resolution_status: args.resolution_status,
      resolution_note: args.resolution_note,
      resolved_by: args.resolved_by,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', args.post_id)

  if (updateErr) throw new Error(`Failed to resolve — ${updateErr.message}`)

  return withMeta({
    post_id: args.post_id,
    resolution_status: args.resolution_status,
    thread_id: post.thread_id,
  })
}
