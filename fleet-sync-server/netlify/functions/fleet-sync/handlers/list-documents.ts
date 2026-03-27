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

/** Columns returned for document metadata (no content). */
const DOC_META_COLS =
  'id, agent_id, title, description, tags, file_type, for_agents, thread_id, created_at'

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

/** Builds a document metadata query with shared filters applied. */
function buildDocQuery(args: ListDocumentsArgs, limit: number) {
  const db = getFleetClient()
  let q = db.from('fleet_documents').select(DOC_META_COLS)
    .order('created_at', { ascending: false }).limit(limit)
  if (args.agent_id) q = q.eq('agent_id', args.agent_id)
  if (args.tags?.length) q = q.contains('tags', args.tags)
  if (args.title_search) q = q.ilike('title', `%${escapeLike(args.title_search)}%`)
  return q
}

/** Merges two arrays by id, sorts by created_at desc, and trims to limit. */
function dedupeByDate(
  a: Record<string, unknown>[],
  b: Record<string, unknown>[],
  limit: number
): Record<string, unknown>[] {
  const seen = new Set<string>()
  const merged: Record<string, unknown>[] = []
  for (const doc of [...a, ...b]) {
    const id = doc.id as string
    if (!seen.has(id)) { seen.add(id); merged.push(doc) }
  }
  merged.sort((x, y) =>
    new Date(y.created_at as string).getTime() - new Date(x.created_at as string).getTime()
  )
  return merged.slice(0, limit)
}

/**
 * Lists fleet documents by metadata. Called by agents browsing
 * shared documents. Returns titles, tags, and dates — never
 * content. Supports filtering by tags, author, target agent,
 * and title search. Default limit 20, max 50.
 */
export async function handleListDocuments(args: ListDocumentsArgs) {
  const limit = Math.min(args.limit ?? 20, 50)

  if (!args.for_agent) {
    const { data, error } = await buildDocQuery(args, limit)
    if (error) throw new Error(`Failed to list documents — ${error.message}`)
    return withMeta({ documents: data ?? [], count: (data ?? []).length })
  }

  // Two type-safe queries — no string interpolation into .or()
  if (!/^[a-zA-Z0-9_-]+$/.test(args.for_agent)) {
    throw new Error('Invalid for_agent — alphanumeric, hyphens, and underscores only')
  }
  const [targeted, pub] = await Promise.all([
    buildDocQuery(args, limit).contains('for_agents', [args.for_agent]),
    buildDocQuery(args, limit).filter('for_agents', 'eq', '{}'),
  ])
  if (targeted.error) throw new Error(`Failed to list documents — ${targeted.error.message}`)
  if (pub.error) throw new Error(`Failed to list documents — ${pub.error.message}`)

  const docs = dedupeByDate(targeted.data ?? [], pub.data ?? [], limit)
  return withMeta({ documents: docs, count: docs.length })
}
