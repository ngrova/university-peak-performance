// ═══════════════════════════════════════════════════════════
// FILE: index.ts
// PURPOSE: Entry point for the fleet-sync Netlify function.
//   Validates auth, parses the JSON-RPC request body, and
//   hands off to the router. This is a thin wiring layer.
// CALLED BY: Netlify Functions runtime (HTTP request)
// DATA FLOW: HTTP request → auth check → parse JSON-RPC →
//   router.ts → HTTP response back to MCP client.
// ═══════════════════════════════════════════════════════════

import { isAuthorized } from './auth'
import { route } from './router'

/**
 * Netlify Functions v2 handler. Receives every HTTP request
 * to /.netlify/functions/fleet-sync. Only POST is accepted
 * (MCP Streamable HTTP). Validates the Bearer token, parses
 * the JSON-RPC body, and delegates to the router.
 */
export default async function handler(request: Request): Promise<Response> {
  // Only POST is supported for MCP Streamable HTTP
  if (request.method !== 'POST') {
    return new Response(null, { status: 405 })
  }

  // Auth check
  if (!isAuthorized(request)) {
    return Response.json(
      { error: 'Unauthorized — provide a valid Bearer token' },
      { status: 401 }
    )
  }

  // Parse JSON-RPC request
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
      { status: 400 }
    )
  }

  // Validate JSON-RPC envelope
  const req = body as Record<string, unknown>
  if (req.jsonrpc !== '2.0' || typeof req.method !== 'string') {
    return Response.json(
      { jsonrpc: '2.0', id: req.id ?? null, error: { code: -32600, message: 'Invalid Request' } },
      { status: 400 }
    )
  }

  return route({
    jsonrpc: req.jsonrpc as string,
    id: req.id as string | number | undefined,
    method: req.method as string,
    params: (req.params as Record<string, unknown>) ?? {},
  })
}
