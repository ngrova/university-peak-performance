// ═══════════════════════════════════════════════════════════
// FILE: index.ts
// PURPOSE: Entry point for the fleet-sync Netlify function.
//   Handles CORS for cross-origin MCP clients (claude.ai),
//   validates auth, parses JSON-RPC, and routes to handlers.
// CALLED BY: Netlify Functions runtime (HTTP request)
// DATA FLOW: HTTP request → CORS check → auth check → parse
//   JSON-RPC → router.ts → add CORS headers → response.
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

/** Adds CORS headers to any Response. */
function withCors(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Netlify Functions v2 handler. Receives every HTTP request
 * to /.netlify/functions/fleet-sync. Handles CORS preflight,
 * validates auth, parses JSON-RPC, and delegates to router.
 * All responses include CORS headers for claude.ai access.
 */
export default async function handler(request: Request): Promise<Response> {
  // CORS preflight — browsers send OPTIONS before cross-origin POST
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  // MCP session termination (stateless — just acknowledge)
  if (request.method === 'DELETE') {
    return withCors(new Response(null, { status: 200 }))
  }

  // Only POST for MCP Streamable HTTP
  if (request.method !== 'POST') {
    return withCors(new Response(null, { status: 405 }))
  }

  // Auth check
  if (!isAuthorized(request)) {
    return withCors(Response.json(
      { error: 'Unauthorized — provide a valid Bearer token' },
      { status: 401 }
    ))
  }

  // Parse JSON-RPC request
  let body: unknown
  try {
    body = await request.json()
  } catch (_parseErr) {
    return withCors(Response.json(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
      { status: 400 }
    ))
  }

  // Validate JSON-RPC envelope
  const req = body as Record<string, unknown>
  if (req.jsonrpc !== '2.0' || typeof req.method !== 'string') {
    return withCors(Response.json(
      { jsonrpc: '2.0', id: req.id ?? null, error: { code: -32600, message: 'Invalid Request' } },
      { status: 400 }
    ))
  }

  const response = await route({
    jsonrpc: req.jsonrpc as string,
    id: req.id as string | number | undefined,
    method: req.method as string,
    params: (req.params as Record<string, unknown>) ?? {},
  })

  return withCors(response)
}
