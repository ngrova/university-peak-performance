// ═══════════════════════════════════════════════════════════
// FILE: post-validation.ts
// PURPOSE: Shared validation constants and helpers for fleet
//   messages — used by both single post and batch post
//   handlers to avoid duplicating validation logic.
// CALLED BY: handlers/post.ts, handlers/batch-post.ts
// DATA FLOW: Post fields → validate kind, summary, body,
//   directed-kind requirements → null if valid, error string
//   if invalid.
// ═══════════════════════════════════════════════════════════

import { requireString, checkLength, checkEnum } from '../validation'

export const VALID_KINDS = [
  'progress', 'decision', 'insight', 'context',
  'recommendation', 'question', 'warning', 'blocker', 'blocker_resolved',
] as const

export const DIRECTED_KINDS = ['recommendation', 'question', 'warning', 'blocker']

interface PostFields {
  kind: string
  summary: string
  body?: string
  to_agent?: string
  urgency?: string
}

/**
 * Validates the fields of a single post (kind, summary, body,
 * directed-kind requirements). Called by handlePost for single
 * posts and by handleBatchPost for each post in the batch.
 * Returns null if valid, an error string if invalid.
 */
export function validatePost(post: PostFields, index?: number): string | null {
  const prefix = index !== undefined ? `Post [${index}]: ` : ''

  const err = requireString(post.kind, 'kind')
    ?? requireString(post.summary, 'summary')
    ?? checkEnum(post.kind, 'kind', VALID_KINDS)
    ?? checkLength(post.summary, 'summary', 200)
    ?? (post.body != null && typeof post.body !== 'string' ? 'body must be a string' : null)
    ?? (typeof post.body === 'string' ? checkLength(post.body, 'body', 4000) : null)

  if (err) return `${prefix}${err}`

  // Directed kinds require to_agent and urgency
  if (DIRECTED_KINDS.includes(post.kind) && (!post.to_agent || !post.urgency)) {
    return `${prefix}${post.kind} messages require to_agent and urgency`
  }

  return null
}
