// ═══════════════════════════════════════════════════════════
// FILE: batch-post.ts
// PURPOSE: Handles the "batch_post" tool — inserts multiple
//   fleet messages in a single atomic database operation.
//   Validates all posts first, rejects entire batch on any
//   validation error.
// CALLED BY: router.ts (when tools/call name = "batch_post")
// DATA FLOW: Array of post args → validate all → idempotency
//   batch check → bulk insert → fanout → return results array.
// ═══════════════════════════════════════════════════════════

import { SupabaseClient } from '@supabase/supabase-js'
import { getFleetClient } from '../db'
import { withMeta } from '../meta'
import { requireString } from '../validation'
import { validatePost } from './post-validation'
import { fanoutBatchResults } from './inbox-fanout'
import { PostItem, DuplicateMap, buildBatchRows } from './batch-rows'

interface BatchPostArgs {
  agent_id: string
  posts: PostItem[]
}

/** Validates top-level args and every post in the batch. */
function validateBatch(args: BatchPostArgs): void {
  const agentErr = requireString(args.agent_id, 'agent_id')
  if (agentErr) throw new Error(agentErr)
  if (!Array.isArray(args.posts)) throw new Error('posts must be an array')
  if (args.posts.length === 0) throw new Error('posts array must not be empty')
  if (args.posts.length > 20) throw new Error('Maximum 20 posts per batch')

  for (let i = 0; i < args.posts.length; i++) {
    const postErr = validatePost(args.posts[i], i)
    if (postErr) throw new Error(postErr)
  }
}

/** Batch-checks idempotency keys in one query. Returns map of existing keys. */
async function checkBatchIdempotency(db: SupabaseClient, posts: PostItem[]): Promise<DuplicateMap> {
  const keys = posts.map((p) => p.idempotency_key).filter((k): k is string => !!k)
  const map: DuplicateMap = new Map()
  if (keys.length === 0) return map

  const { data, error } = await db
    .from('fleet_messages')
    .select('id, thread_id, idempotency_key')
    .in('idempotency_key', keys)
  if (error) throw new Error(`Idempotency check failed — ${error.message}`)

  for (const row of data ?? []) {
    map.set(row.idempotency_key as string, {
      id: row.id as string,
      thread_id: row.thread_id as string,
    })
  }
  return map
}

/**
 * Posts multiple messages in a single atomic operation. Called
 * by agents that need to share several related updates at once.
 * Validates every post first — if any fails, none are inserted.
 * Handles idempotency per-post via batch key lookup.
 */
export async function handleBatchPost(args: BatchPostArgs) {
  const db = getFleetClient()
  validateBatch(args)

  const dupes = await checkBatchIdempotency(db, args.posts)
  const { rows, results, indexMap } = buildBatchRows(args.posts, args.agent_id, dupes)

  if (rows.length > 0) {
    const { data: inserted, error } = await db
      .from('fleet_messages').insert(rows).select('id').limit(rows.length)
    if (error) throw new Error(`Failed to insert batch — ${error.message}`)
    for (let j = 0; j < (inserted ?? []).length; j++) {
      results[indexMap[j]].post_id = (inserted![j] as { id: string }).id
    }
  }

  // Update agent timestamp — non-fatal since posts are already committed
  const { error: syncErr } = await db.from('fleet_agents')
    .update({ updated_at: new Date().toISOString() })
    .eq('agent_id', args.agent_id)

  // Fan out inbox notifications — non-fatal
  const inboxWarnings = await fanoutBatchResults(db, results, args.posts, args.agent_id)

  const created = results.filter((r) => r.status === 'created').length
  const duplicates = results.filter((r) => r.status === 'duplicate_ignored').length
  const warnings = [
    ...(syncErr ? [`Agent timestamp update failed: ${syncErr.message}`] : []),
    ...inboxWarnings,
  ]
  return withMeta({
    results, created, duplicates,
    ...(warnings.length > 0 ? { warning: warnings.join('; ') } : {}),
  })
}
