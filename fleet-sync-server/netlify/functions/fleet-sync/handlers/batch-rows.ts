// ═══════════════════════════════════════════════════════════
// FILE: batch-rows.ts
// PURPOSE: Builds insert rows for batch post operations —
//   maps validated post items into fleet_messages row objects,
//   skipping duplicates detected by idempotency check.
// CALLED BY: handlers/batch-post.ts
// DATA FLOW: PostItem[] + agent_id + duplicates map →
//   insert rows + results array + index mapping.
// ═══════════════════════════════════════════════════════════

import { DIRECTED_KINDS } from './post-validation'

export interface PostItem {
  kind: string
  summary: string
  body?: string
  tags?: string[]
  to_agent?: string
  urgency?: string
  thread_id?: string
  refs?: string[]
  idempotency_key?: string
  relay_type?: string
  chain_id?: string
  depth?: number
  reply_to?: string
  notify_self?: boolean
}

export type ResultItem = {
  post_id: string
  thread_id: string
  status: string
}

export type DuplicateMap = Map<string, { id: string; thread_id: string }>

/**
 * Builds insert rows and a results array from a batch of posts.
 * Called by handleBatchPost after validation and idempotency
 * checks. Skips posts whose idempotency_key already exists.
 * Returns rows for INSERT, a results array, and an index map
 * linking inserted rows back to their result positions.
 */
export function buildBatchRows(
  posts: PostItem[],
  agentId: string,
  dupes: DuplicateMap
): { rows: Record<string, unknown>[]; results: ResultItem[]; indexMap: number[] } {
  const results: ResultItem[] = []
  const rows: Record<string, unknown>[] = []
  const indexMap: number[] = []

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]
    if (post.idempotency_key && dupes.has(post.idempotency_key)) {
      const dup = dupes.get(post.idempotency_key)!
      results.push({ post_id: dup.id, thread_id: dup.thread_id, status: 'duplicate_ignored' })
      continue
    }
    const threadId = post.thread_id ?? crypto.randomUUID()
    const isDirected = DIRECTED_KINDS.includes(post.kind)
    rows.push({
      agent_id: agentId, kind: post.kind, summary: post.summary,
      body: post.body ?? null, tags: post.tags ?? [],
      to_agent: post.to_agent ?? null, urgency: post.urgency ?? null,
      thread_id: threadId, refs: post.refs ?? [],
      idempotency_key: post.idempotency_key ?? null,
      resolution_status: isDirected ? 'open' : null,
      relay_type: post.relay_type ?? null,
      chain_id: post.chain_id ?? null,
      depth: post.depth ?? 0,
      reply_to: post.reply_to ?? null,
      notify_self: post.notify_self ?? false,
    })
    results.push({ post_id: '', thread_id: threadId, status: 'created' })
    indexMap.push(results.length - 1)
  }
  return { rows, results, indexMap }
}
