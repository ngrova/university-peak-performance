// ═══════════════════════════════════════════════════════════
// FILE: read-decisions.ts
// PURPOSE: Handles the "read_decisions" tool — queries fleet
//   decisions with optional filters for domain, status, and
//   affected agent.
// CALLED BY: router.ts (when tools/call name = "read_decisions")
// DATA FLOW: Filter args → build Supabase query → return
//   matching decisions.
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../db'
import { withMeta } from '../meta'

interface ReadDecisionsArgs {
  domain?: string
  status?: string
  affects_agent?: string
  limit?: number
}

/**
 * Queries fleet decisions with optional filters. Called when
 * an agent wants to review active decisions, check what
 * applies to it, or browse a specific domain's decision
 * history. Defaults to active decisions, limit 50.
 */
export async function handleReadDecisions(args: ReadDecisionsArgs) {
  const db = getFleetClient()
  const status = args.status ?? 'active'
  const limit = Math.min(args.limit ?? 50, 50)

  let query = db
    .from('fleet_decisions')
    .select(
      'id, decision, reasoning, decided_by, domain, affects_agents, ' +
      'acknowledged_by, status, supersedes, superseded_by, source_thread_id, created_at'
    )
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (args.domain) query = query.eq('domain', args.domain)
  if (args.affects_agent) {
    query = query.contains('affects_agents', [args.affects_agent])
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to read decisions — ${error.message}`)

  return withMeta({ decisions: data ?? [], count: (data ?? []).length })
}
