// ═══════════════════════════════════════════════════════════
// FILE: db.ts
// PURPOSE: Creates a Supabase client for the fleet-sync
//   function using the service_role key so it can read/write
//   fleet tables that have RLS enabled with no policies.
// CALLED BY: handlers/sync.ts, handlers/post.ts,
//   handlers/respond.ts, handlers/record-decision.ts,
//   handlers/read-decisions.ts, handlers/read-post.ts
// DATA FLOW: Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
//   from environment → returns a configured Supabase client.
// ═══════════════════════════════════════════════════════════

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Returns a Supabase client configured with the service_role key.
 * Called by every handler before any database operation.
 * Caches the client for reuse across invocations in the same
 * function instance. Throws if env vars are missing.
 */
export function getFleetClient(): SupabaseClient {
  if (client) return client

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  client = createClient(url, key)
  return client
}
