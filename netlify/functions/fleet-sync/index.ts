// ═══════════════════════════════════════════════════════════
// FILE: index.ts
// PURPOSE: Entry point for the fleet-sync Netlify function.
//   Uses v1 handler format (named export) for reliable bundling.
//   Handles CORS, auth, JSON-RPC parsing, and routes to handlers.
// CALLED BY: Netlify Functions runtime (HTTP request)
// DATA FLOW: v1 event → build Request → CORS/auth/parse →
//   router.ts → convert Response back to v1 format.
// ═══════════════════════════════════════════════════════════

import { isAuthorized } from './auth.ts'
import { route } from './router.ts'

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

/**
 * Netlify Functions v1 handler. Named export so esbuild's
 * CommonJS output produces `exports.handler` which Netlify
 * reliably detects. Handles CORS, auth, JSON-RPC parsing,
 * then delegates to the MCP router.
 */
export async function handler(event: {
  httpMethod: string
  headers: Record<string, string>
  body: string | null
}): Promise<V1Response> {
  const method = event.httpMethod

  // CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 204, body: '', headers: CORS_HEADERS }
  }

  // MCP session termination (stateless — just acknowledge)
  if (method === 'DELETE') {
    return respond(200, '')
  }

  // Only POST for MCP Streamable HTTP
  if (method !== 'POST') {
    return respond(405, '')
  }

  // Auth check — build a minimal Request for the auth module
  const authReq = new Request('https://localhost', {
    headers: event.headers,
  })
  if (!isAuthorized(authReq)) {
    return respond(401, JSON.stringify({
      error: 'Unauthorized — provide a valid Bearer token',
    }))
  }

  // Parse JSON-RPC request
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(event.body ?? '')
  } catch (_parseErr) {
    return respond(400, JSON.stringify({
      jsonrpc: '2.0', id: null,
      error: { code: -32700, message: 'Parse error' },
    }))
  }

  // Validate JSON-RPC envelope
  if (parsed.jsonrpc !== '2.0' || typeof parsed.method !== 'string') {
    return respond(400, JSON.stringify({
      jsonrpc: '2.0', id: parsed.id ?? null,
      error: { code: -32600, message: 'Invalid Request' },
    }))
  }

  // Route to MCP handler — returns a Response object
  const response = await route({
    jsonrpc: parsed.jsonrpc as string,
    id: parsed.id as string | number | undefined,
    method: parsed.method as string,
    params: (parsed.params as Record<string, unknown>) ?? {},
  })

  // Convert Response back to v1 format
  const responseBody = await response.text()
  const responseHeaders: Record<string, string> = { ...CORS_HEADERS }
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value
  })

  return {
    statusCode: response.status,
    body: responseBody,
    headers: responseHeaders,
  }
}
