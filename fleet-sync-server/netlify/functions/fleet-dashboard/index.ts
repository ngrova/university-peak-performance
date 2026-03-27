// ═══════════════════════════════════════════════════════════
// FILE: index.ts
// PURPOSE: Netlify function entry point for the fleet
//   dashboard API — handles CORS, optional auth, parses date
//   param, fetches fleet data, and returns JSON payload.
// CALLED BY: Netlify (HTTP GET /.netlify/functions/fleet-dashboard)
// DATA FLOW: Request → auth → parse date → fetchAllData →
//   buildAgentMap → computeHumanStats → JSON response.
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../fleet-sync/db'
import { isAuthorized } from '../fleet-sync/auth'
import { fetchAllData, getEasternDayBounds } from './queries'
import { buildAgentMap, computeHumanDashboardStats } from './stats'

const ALLOWED_ORIGIN = 'https://fleet-sync-upp.netlify.app'

/** Builds a Response with standard CORS and JSON headers. */
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization',
    },
  })
}

/**
 * Dashboard API handler. Parses optional ?date param,
 * fetches fleet data for that Eastern Time day, computes
 * human-centric stats, and returns combined JSON payload.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return jsonResponse({}, 200)
  if (!isAuthorized(request)) return jsonResponse({ error: 'Unauthorized' }, 401)

  try {
    const url = new URL(request.url)
    const { start, end, dateStr } = getEasternDayBounds(
      url.searchParams.get('date') || undefined
    )
    const data = await fetchAllData(getFleetClient(), start, end)
    const agentMap = buildAgentMap(data.agents)
    const humanStats = computeHumanDashboardStats(
      data.messages, data.decisions, agentMap
    )
    return jsonResponse({
      date: dateStr, agents: data.agents, messages: data.messages,
      decisions: data.decisions, open_items: data.openItems,
      agent_map: agentMap, human_stats: humanStats,
    }, 200)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    process.stderr.write(`[fleet-dashboard] ${msg}\n`)
    return jsonResponse({ error: 'Failed to load fleet data — try again' }, 500)
  }
}
