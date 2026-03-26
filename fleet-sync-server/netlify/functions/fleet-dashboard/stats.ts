// ═══════════════════════════════════════════════════════════
// FILE: stats.ts
// PURPOSE: Computes summary statistics from raw fleet data —
//   active/planned agent counts, today's message count, open
//   items count, and active decisions count for KPI cards.
// CALLED BY: index.ts (the dashboard API entry point)
// DATA FLOW: Raw query arrays → count/filter → stats object.
// ═══════════════════════════════════════════════════════════

interface DashboardStats {
  active_agents: number
  planned_agents: number
  messages_today: number
  open_items: number
  active_decisions: number
}

/**
 * Derives dashboard KPI stats from the raw query results.
 * Called after fetchAllData returns. Counts active agents
 * (synced in the last 24 hours), planned agents (never synced
 * or stale), today's messages, open items, and active
 * decisions. Returns a flat stats object for the JSON payload.
 */
export function computeStats(
  agents: Record<string, unknown>[],
  messages: Record<string, unknown>[],
  decisions: Record<string, unknown>[],
  openItems: Record<string, unknown>[]
): DashboardStats {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date().toISOString().slice(0, 10)

  // Active = any activity in last 24h, planned = everyone else
  const active = agents.filter(
    (a) => typeof a.updated_at === 'string' && a.updated_at > oneDayAgo
  )

  const todayMessages = messages.filter(
    (m) => typeof m.created_at === 'string' && m.created_at >= todayStart
  )

  return {
    active_agents: active.length,
    planned_agents: agents.length - active.length,
    messages_today: todayMessages.length,
    open_items: openItems.length,
    active_decisions: decisions.length,
  }
}
