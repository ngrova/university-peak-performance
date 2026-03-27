// ═══════════════════════════════════════════════════════════
// FILE: get-document.ts
// PURPOSE: Handles the "get_document" tool — fetches a single
//   document with full content, supporting optional partial
//   reads via offset and length parameters.
// CALLED BY: router.ts (when tools/call name = "get_document")
// DATA FLOW: document_id → fetch from fleet_documents → slice
//   content if offset/length specified → return full metadata
//   plus content.
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../db'
import { withMeta } from '../meta'
import { requireString } from '../validation'

interface GetDocumentArgs {
  document_id: string
  offset?: number
  length?: number
}

/**
 * Fetches a document with its full content. Called by agents
 * that need to read a specific document found via list_documents.
 * Supports partial reads — offset and length slice the content
 * on the server before returning it.
 */
export async function handleGetDocument(args: GetDocumentArgs) {
  const db = getFleetClient()

  const err = requireString(args.document_id, 'document_id')
  if (err) throw new Error(err)

  const { data, error } = await db
    .from('fleet_documents')
    .select(
      'id, agent_id, title, description, tags, file_type, ' +
      'for_agents, thread_id, schema_version, content, created_at'
    )
    .eq('id', args.document_id)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch document — ${error.message}`)
  if (!data) throw new Error('Document not found')

  const fullContent = (data.content as string) ?? ''
  const totalLength = fullContent.length
  const start = args.offset ?? 0
  const end = args.length ? start + args.length : totalLength
  const slice = fullContent.slice(start, end)

  return withMeta({
    document: { ...data, content: slice },
    total_length: totalLength,
    offset: start,
    returned_length: slice.length,
  })
}
