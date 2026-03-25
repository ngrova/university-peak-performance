// ═══════════════════════════════════════════════════════════
// FILE: index.ts
// PURPOSE: Entry point for the fleet-sync Netlify function.
//   Uses v1 handler format (named export) for reliable bundling.
//   Handles CORS, auth, JSON-RPC parsing, and routes to handlers.
// CALLED BY: Netlify Functions runtime (HTTP request)
// DATA FLOW: v1 event → build Request → CORS/auth/parse →
//   router.ts → convert Response back to v1 format.
// ═══════════════════════════════════════════════════════════

import { isAuthorized } from './auth'
import { route } from './router'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
  'Access-Control-Max-Age': '86400',
}

/** V1 response shape Netlify expects. */
interface V1Response {
  statusCode: number
  body: string
  headers: Record<string, string>
}

/** Builds a v1 response with CORS headers. */
function respond(statusCode: number, body: string, extra?: Record<string, string>): V1Response {
  return {
    statusCode,
    body,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extra },
  }
}

/** Checks auth and parses the JSON-RPC body from the event. */
function parseRequest(event: { headers: Record<string, string>; body: string | null }): V1Response | Record<string, unknown> {
  const authReq = new Request('https://localhost', { headers: event.headers })
  if (!isAuthorized(authReq)) {
    return respond(401, JSON.stringify({ error: 'Unauthorized — provide a valid Bearer token' }))
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(event.body ?? '')
  } catch (_parseErr) {
    return respond(400, JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }))
  }

  if (parsed.jsonrpc !== '2.0' || typeof parsed.method !== 'string') {
    return respond(400, JSON.stringify({ jsonrpc: '2.0', id: parsed.id ?? null, error: { code: -32600, message: 'Invalid Request' } }))
  }

  return parsed
}

/** Converts a Web Response to v1 format with CORS headers. */
async function toV1Response(response: Response): Promise<V1Response> {
  const body = await response.text()
  const headers: Record<string, string> = { ...CORS_HEADERS }
  response.headers.forEach((value, key) => { headers[key] = value })
  return { statusCode: response.status, body, headers }
}

/**
 * Netlify Functions v1 handler. Named export so esbuild's
 * CommonJS output produces `exports.handler` which Netlify
 * reliably detects. Delegates to parseRequest for auth and
 * validation, then routes to the MCP handler.
 */
export async function handler(event: {
  httpMethod: string
  headers: Record<string, string>
  body: string | null
}): Promise<V1Response> {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, body: '', headers: CORS_HEADERS }
  if (event.httpMethod === 'DELETE') return respond(200, '')
  if (event.httpMethod !== 'POST') return respond(405, '')

  const result = parseRequest(event)
  if ('statusCode' in result) return result as V1Response

  const parsed = result
  const response = await route({
    jsonrpc: parsed.jsonrpc as string,
    id: parsed.id as string | number | undefined,
    method: parsed.method as string,
    params: (parsed.params as Record<string, unknown>) ?? {},
  })

  return toV1Response(response)
}
