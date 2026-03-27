// ═══════════════════════════════════════════════════════════
// FILE: index.ts
// PURPOSE: Netlify function entry point for the fleet
//   dashboard API — handles CORS, optional auth, fetches all
//   fleet data, and returns a single JSON payload.
// CALLED BY: Netlify (HTTP GET /.netlify/functions/fleet-dashboard)
// DATA FLOW: Request → auth check → fetchAllData → computeStats
//   → JSON response with agents, messages, decisions, stats.
// ═══════════════════════════════════════════════════════════

import { getFleetClient } from '../fleet-sync/db'
import { isAuthorized } from '../fleet-sync/auth'
import { fetchAllData } from './queries'
import { computeStats } from './stats'

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
 * Dashboard API handler. Called on every GET request to the
 * fleet-dashboard function URL. Checks optional auth, runs
 * all fleet queries in parallel, computes KPI stats, and
 * returns the combined JSON payload. Returns 500 with an
 * error message if any query fails — never empty arrays.
 */
export default async function handler(request: Request): Promise<Response> {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') return jsonResponse({}, 200)

  if (!isAuthorized(request)) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    const db = getFleetClient()
    const data = await fetchAllData(db)
    const stats = computeStats(
      data.agents, data.messages, data.decisions,
      data.openItems, data.documents
    )

    return jsonResponse({
      agents: data.agents,
      messages: data.messages,
      decisions: data.decisions,
      open_items: data.openItems,
      documents: data.documents,
      stats,
    }, 200)
  } catch (err: unknown) {
    // Log to Netlify function logs for debugging (server-side, not client)
    const message = err instanceof Error ? err.message : 'Unknown error'
    process.stderr.write(`[fleet-dashboard] ${message}\n`)
    return jsonResponse({ error: 'Failed to load fleet data — try again' }, 500)
  }
}
