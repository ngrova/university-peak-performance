// ═══════════════════════════════════════════════════════════
// FILE: post.ts
// PURPOSE: Handles the "post" tool — writes a message to the
//   fleet communication stream with idempotency, validation,
//   and auto-generated thread IDs.
// CALLED BY: router.ts (when tools/call name = "post")
// DATA FLOW: Post args → validate → idempotency check →
//   insert fleet_messages → update agent sync time → return ID.
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../db'
import { withMeta } from '../meta'
import { requireString } from '../validation'
import { DIRECTED_KINDS, validatePost } from './post-validation'

interface PostArgs {
  agent_id: string
  kind: string
  summary: string
  body?: string
  tags?: string[]
  to_agent?: string
  urgency?: string
  thread_id?: string
  refs?: string[]
  idempotency_key?: string
}

/**
 * Posts a message to the fleet stream. Called by any agent
 * that wants to share progress, decisions, questions, or
 * blockers. Checks idempotency key first, validates all
 * fields, inserts the message, and updates the agent's
 * last_synced_at timestamp.
 */
export async function handlePost(args: PostArgs) {
  const db = getFleetClient()

  // Idempotency check — maybeSingle returns null (not error) when no row
  if (args.idempotency_key) {
    const { data: existing, error: dupErr } = await db
      .from('fleet_messages')
      .select('id, thread_id')
      .eq('idempotency_key', args.idempotency_key)
      .maybeSingle()

    if (dupErr) throw new Error(`Idempotency check failed — ${dupErr.message}`)
    if (existing) {
      return withMeta({
        post_id: existing.id,
        thread_id: existing.thread_id,
        status: 'duplicate_ignored',
      })
    }
  }

  // Validate inputs — shared validation handles kind, summary, body, directed rules
  const err = requireString(args.agent_id, 'agent_id') ?? validatePost(args)
  if (err) throw new Error(err)

  const threadId = args.thread_id ?? crypto.randomUUID()
  const isDirected = DIRECTED_KINDS.includes(args.kind)

  const { data, error } = await db
    .from('fleet_messages')
    .insert({
      agent_id: args.agent_id,
      kind: args.kind,
      summary: args.summary,
      body: args.body ?? null,
      tags: args.tags ?? [],
      to_agent: args.to_agent ?? null,
      urgency: args.urgency ?? null,
      thread_id: threadId,
      refs: args.refs ?? [],
      idempotency_key: args.idempotency_key ?? null,
      resolution_status: isDirected ? 'open' : null,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to post message — ${error.message}`)

  // Update agent's updated_at (NOT last_synced_at — that is sync-only)
  const { error: syncErr } = await db
    .from('fleet_agents')
    .update({ updated_at: new Date().toISOString() })
    .eq('agent_id', args.agent_id)
  if (syncErr) throw new Error(`Failed to update agent timestamp — ${syncErr.message}`)

  return withMeta({
    post_id: data.id,
    thread_id: threadId,
    status: 'created',
  })
}
