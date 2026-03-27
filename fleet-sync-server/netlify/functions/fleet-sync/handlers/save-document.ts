// ═══════════════════════════════════════════════════════════
// FILE: save-document.ts
// PURPOSE: Handles the "save_document" tool — stores a text
//   document in fleet storage so agents can share large
//   content (up to 100K chars) like specs and prompts.
// CALLED BY: router.ts (when tools/call name = "save_document")
// DATA FLOW: Document args → validate → idempotency check →
//   insert fleet_documents → update agent timestamp → return ID.
// ═══════════════════════════════════════════════════════════

import { SupabaseClient } from '@supabase/supabase-js'
import { getFleetClient } from '../db'
import { withMeta } from '../meta'
import { requireString, checkLength, checkEnum } from '../validation'

const VALID_FILE_TYPES = [
  'text/markdown', 'text/plain', 'application/json',
  'text/csv', 'text/html',
] as const

interface SaveDocumentArgs {
  agent_id: string
  title: string
  content: string
  description?: string
  file_type?: string
  tags?: string[]
  for_agents?: string[]
  thread_id?: string
  idempotency_key?: string
}

/** Validates all document fields. Returns error string or null. */
function validateDocumentArgs(args: SaveDocumentArgs): string | null {
  return requireString(args.agent_id, 'agent_id')
    ?? requireString(args.title, 'title')
    ?? requireString(args.content, 'content')
    ?? checkLength(args.title, 'title', 200)
    ?? checkLength(args.content, 'content', 100000)
    ?? (args.description ? checkLength(args.description, 'description', 500) : null)
    ?? (args.file_type ? checkEnum(args.file_type, 'file_type', VALID_FILE_TYPES) : null)
}

/** Checks if a document with this idempotency key already exists. */
async function checkIdempotency(db: SupabaseClient, key: string) {
  const { data, error } = await db
    .from('fleet_documents')
    .select('id, title')
    .eq('idempotency_key', key)
    .maybeSingle()
  if (error) throw new Error(`Idempotency check failed — ${error.message}`)
  return data
}

/** Inserts the document row and returns the new ID. */
async function insertDocument(db: SupabaseClient, args: SaveDocumentArgs) {
  const { data, error } = await db
    .from('fleet_documents')
    .insert({
      agent_id: args.agent_id,
      title: args.title,
      content: args.content,
      description: args.description ?? null,
      file_type: args.file_type ?? 'text/markdown',
      tags: args.tags ?? [],
      for_agents: args.for_agents ?? [],
      thread_id: args.thread_id ?? null,
      idempotency_key: args.idempotency_key ?? null,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Failed to save document — ${error.message}`)
  return data.id as string
}

/**
 * Saves a document to fleet storage. Called by agents that need
 * to share large text content. Checks idempotency first, validates
 * fields, inserts the document, and updates the agent timestamp.
 */
export async function handleSaveDocument(args: SaveDocumentArgs) {
  const db = getFleetClient()

  // Return early if duplicate
  if (args.idempotency_key) {
    const existing = await checkIdempotency(db, args.idempotency_key)
    if (existing) {
      return withMeta({
        document_id: existing.id,
        title: existing.title,
        status: 'duplicate_ignored' as const,
      })
    }
  }

  const err = validateDocumentArgs(args)
  if (err) throw new Error(err)

  const docId = await insertDocument(db, args)

  // Update agent's updated_at (NOT last_synced_at)
  const { error: syncErr } = await db
    .from('fleet_agents')
    .update({ updated_at: new Date().toISOString() })
    .eq('agent_id', args.agent_id)
  if (syncErr) throw new Error(`Failed to update agent timestamp — ${syncErr.message}`)

  return withMeta({
    document_id: docId,
    title: args.title,
    size: args.content.length,
    status: 'created' as const,
  })
}
