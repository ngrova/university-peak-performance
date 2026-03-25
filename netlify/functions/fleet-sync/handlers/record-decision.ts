// ═══════════════════════════════════════════════════════════
// FILE: record-decision.ts
// PURPOSE: Handles the "record_decision" tool — creates a
//   permanent fleet decision with optional supersedes chain
//   and domain conflict detection.
// CALLED BY: router.ts (when tools/call name = "record_decision")
// DATA FLOW: Decision args → idempotency check → validate →
//   handle supersedes → check domain conflicts → insert →
//   return decision_id.
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../db'
import { withMeta } from '../meta'
import { requireString } from '../validation'

interface RecordDecisionArgs {
  decision: string
  reasoning: string
  decided_by: string
  domain: string
  affects_agents?: string[]
  supersedes?: string
  source_thread_id?: string
  idempotency_key?: string
}

/**
 * Records a permanent fleet decision. Called when a human or
 * agent makes a decision that should be remembered across all
 * projects. Handles idempotency, supersedes chains (marking
 * old decisions as superseded), and advisory domain conflict
 * warnings when multiple active decisions exist in a domain.
 */
export async function handleRecordDecision(args: RecordDecisionArgs) {
  const db = getFleetClient()

  // Idempotency check — maybeSingle returns null (not error) when no row
  if (args.idempotency_key) {
    const { data: existing, error: dupErr } = await db
      .from('fleet_decisions')
      .select('id')
      .eq('idempotency_key', args.idempotency_key)
      .maybeSingle()
    if (dupErr) throw new Error(`Idempotency check failed — ${dupErr.message}`)
    if (existing) {
      return withMeta({ decision_id: existing.id, status: 'duplicate_ignored' })
    }
  }

  const err = requireString(args.decision, 'decision')
    ?? requireString(args.reasoning, 'reasoning')
    ?? requireString(args.decided_by, 'decided_by')
    ?? requireString(args.domain, 'domain')
  if (err) throw new Error(err)

  let supersededId: string | null = null

  // Handle supersedes chain
  if (args.supersedes) {
    const { data: old, error: findErr } = await db
      .from('fleet_decisions')
      .select('id, status')
      .eq('id', args.supersedes)
      .single()

    if (findErr || !old) throw new Error('Superseded decision not found')
    if (old.status !== 'active') throw new Error('Can only supersede active decisions')
    supersededId = old.id
  }

  // Check for domain conflicts (advisory, not blocking)
  let domainConflictWarning: string | null = null
  const { data: existing, error: conflictErr } = await db
    .from('fleet_decisions')
    .select('id, decision')
    .eq('domain', args.domain)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)
  if (conflictErr) throw new Error(`Conflict check failed — ${conflictErr.message}`)

  const conflicts = (existing ?? []).filter((d) => d.id !== args.supersedes)
  if (conflicts.length > 0) {
    domainConflictWarning =
      `${conflicts.length} other active decision(s) in domain "${args.domain}"`
  }

  // Insert new decision
  const { data, error: insertErr } = await db
    .from('fleet_decisions')
    .insert({
      decision: args.decision,
      reasoning: args.reasoning,
      decided_by: args.decided_by,
      domain: args.domain,
      affects_agents: args.affects_agents ?? [],
      supersedes: args.supersedes ?? null,
      source_thread_id: args.source_thread_id ?? null,
      idempotency_key: args.idempotency_key ?? null,
      status: 'active',
    })
    .select('id')
    .single()

  if (insertErr) throw new Error(`Failed to record decision — ${insertErr.message}`)

  // Mark old decision as superseded
  if (supersededId) {
    const { error: superErr } = await db
      .from('fleet_decisions')
      .update({ status: 'superseded', superseded_by: data.id })
      .eq('id', supersededId)
    if (superErr) throw new Error(`Failed to mark superseded — ${superErr.message}`)
  }

  return withMeta({
    decision_id: data.id,
    superseded_decision_id: supersededId,
    domain_conflict_warning: domainConflictWarning,
  })
}
