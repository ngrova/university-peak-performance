// ═══════════════════════════════════════════════════════════
// FILE: list-documents.ts
// PURPOSE: Handles the "list_documents" tool — returns
//   lightweight metadata for fleet documents without content,
//   with optional filters for tags, agent, and title search.
// CALLED BY: router.ts (when tools/call name = "list_documents")
// DATA FLOW: Filter args → build Supabase query → return
//   document metadata array (no content column).
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../db'
import { withMeta } from '../meta'

/** Strips characters that could break PostgREST filter syntax. */
function sanitizeAgentId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '')
}

/** Escapes SQL LIKE wildcards so user input is treated as literal. */
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&')
}

interface ListDocumentsArgs {
  tags?: string[]
  agent_id?: string
  for_agent?: string
  title_search?: string
  limit?: number
}

/**
 * Lists fleet documents by metadata. Called by agents browsing
 * shared documents. Returns titles, tags, and dates — never
 * content. Supports filtering by tags, author, target agent,
 * and title search. Default limit 20, max 50.
 */
export async function handleListDocuments(args: ListDocumentsArgs) {
  const db = getFleetClient()
  const limit = Math.min(args.limit ?? 20, 50)

  let query = db
    .from('fleet_documents')
    .select(
      'id, agent_id, title, description, tags, file_type, ' +
      'for_agents, thread_id, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  // Apply optional filters
  if (args.agent_id) {
    query = query.eq('agent_id', args.agent_id)
  }
  if (args.tags && args.tags.length > 0) {
    query = query.contains('tags', args.tags)
  }
  if (args.for_agent) {
    // Sanitize to prevent PostgREST filter injection via .or() string
    const safe = sanitizeAgentId(args.for_agent)
    query = query.or(`for_agents.cs.{"${safe}"},for_agents.eq.{}`)
  }
  if (args.title_search) {
    // Escape LIKE wildcards so user input is treated as literal text
    query = query.ilike('title', `%${escapeLike(args.title_search)}%`)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to list documents — ${error.message}`)

  return withMeta({
    documents: data ?? [],
    count: (data ?? []).length,
  })
}
