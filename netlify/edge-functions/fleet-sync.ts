// ═══════════════════════════════════════════════════════════
// FILE: fleet-sync.ts (Edge Function)
// PURPOSE: Edge function entry point for the Fleet Sync MCP
//   server. Runs BEFORE the Next.js plugin in the request
//   chain, bypassing the catch-all routing conflict. Handles
//   CORS, auth, JSON-RPC parsing, then delegates to the router.
// CALLED BY: Netlify Edge Functions runtime at /mcp
// DATA FLOW: HTTP request → CORS → auth → parse JSON-RPC →
//   router → response with CORS headers.
// ═══════════════════════════════════════════════════════════

import { isAuthorized } from '../functions/fleet-sync/auth.ts'
import { route } from '../functions/fleet-sync/router.ts'

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
 * Edge function handler for the MCP server. Receives every
 * request to /mcp. Handles CORS preflight, validates auth,
 * parses JSON-RPC body, and delegates to the MCP router.
 */
export default async function handler(request: Request) {
  // CORS preflight
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
  let parsed: Record<string, unknown>
  try {
    parsed = await request.json() as Record<string, unknown>
  } catch (_parseErr) {
    return withCors(Response.json(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
      { status: 400 }
    ))
  }

  // Validate JSON-RPC envelope
  if (parsed.jsonrpc !== '2.0' || typeof parsed.method !== 'string') {
    return withCors(Response.json(
      { jsonrpc: '2.0', id: parsed.id ?? null, error: { code: -32600, message: 'Invalid Request' } },
      { status: 400 }
    ))
  }

  const response = await route({
    jsonrpc: parsed.jsonrpc as string,
    id: parsed.id as string | number | undefined,
    method: parsed.method as string,
    params: (parsed.params as Record<string, unknown>) ?? {},
  })

  return withCors(response)
}

export const config = { path: '/mcp' }
