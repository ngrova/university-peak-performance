// ═══════════════════════════════════════════════════════════
// FILE: read-post.ts
// PURPOSE: Handles the "read_post" tool — fetches a single
//   post with its full untruncated body plus all other posts
//   in the same thread for context.
// CALLED BY: router.ts (when tools/call name = "read_post")
// DATA FLOW: post_id → fetch post → fetch thread siblings →
//   return post + thread array.
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../db'
import { withMeta } from '../meta'
import { requireString } from '../validation'

const POST_COLUMNS =
  'id, agent_id, kind, thread_id, summary, body, tags, to_agent, ' +
  'urgency, resolution_status, resolution_note, resolved_by, ' +
  'resolved_at, refs, relay_type, chain_id, depth, reply_to, ' +
  'notify_self, created_at'

interface ReadPostArgs {
  post_id: string
}

/**
 * Fetches a single post with full body and its entire thread.
 * Called when an agent needs the complete context of a message
 * — the sync briefing truncates bodies to 500 chars, so this
 * tool provides the untruncated version plus thread history.
 */
export async function handleReadPost(args: ReadPostArgs) {
  const db = getFleetClient()

  const err = requireString(args.post_id, 'post_id')
  if (err) throw new Error(err)

  // Fetch the requested post
  const { data: post, error: postErr } = await db
    .from('fleet_messages')
    .select(POST_COLUMNS)
    .eq('id', args.post_id)
    .single()

  if (postErr || !post) throw new Error('Post not found')

  // Fetch thread siblings if thread_id exists
  let thread: typeof post[] = []
  if (post.thread_id) {
    const { data: siblings, error: threadErr } = await db
      .from('fleet_messages')
      .select(POST_COLUMNS)
      .eq('thread_id', post.thread_id)
      .neq('id', args.post_id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (threadErr) throw new Error(`Failed to fetch thread — ${threadErr.message}`)
    thread = siblings ?? []
  }

  return withMeta({ post, thread })
}
