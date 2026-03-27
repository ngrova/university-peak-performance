// ═══════════════════════════════════════════════════════════
// FILE: router.ts
// PURPOSE: Routes incoming JSON-RPC 2.0 requests to the
//   correct MCP method handler (initialize, tools/list,
//   tools/call, ping) and formats responses.
// CALLED BY: index.ts
// DATA FLOW: Parsed JSON-RPC request → dispatch by method →
//   call tool handler → wrap in JSON-RPC response envelope.
// ═══════════════════════════════════════════════════════════

import { TOOLS, TOOL_MAP } from './tools'
import { checkRateLimit } from './rate-limiter'
import { handleSync } from './handlers/sync'
import { handlePost } from './handlers/post'
import { handleRespond } from './handlers/respond'
import { handleRecordDecision } from './handlers/record-decision'
import { handleReadDecisions } from './handlers/read-decisions'
import { handleReadPost } from './handlers/read-post'
import { handleSaveDocument } from './handlers/save-document'
import { handleListDocuments } from './handlers/list-documents'
import { handleGetDocument } from './handlers/get-document'
import { handleBatchPost } from './handlers/batch-post'

interface JsonRpcRequest {
  jsonrpc: string
  id?: string | number
  method: string
  params?: Record<string, unknown>
}

const WRITE_TOOLS = new Set(['post', 'respond', 'record_decision', 'save_document', 'batch_post'])

/**
 * Routes a JSON-RPC request to the appropriate handler.
 * Called by index.ts after auth succeeds and the request body
 * is parsed. Returns a Response object — either a JSON-RPC
 * result, a JSON-RPC error, or 202 for notifications.
 */
export async function route(req: JsonRpcRequest): Promise<Response> {
  // Notifications (no id) get 202
  if (req.id === undefined) return new Response(null, { status: 202 })

  if (req.method === 'initialize') return jsonRpcOk(req.id, initResult())
  if (req.method === 'ping') return jsonRpcOk(req.id, {})
  if (req.method === 'tools/list') return jsonRpcOk(req.id, { tools: TOOLS })

  if (req.method === 'tools/call') return handleToolCall(req)

  return jsonRpcError(req.id, -32601, `Method not found: ${req.method}`)
}

/** Dispatches a tools/call request to the correct handler. */
async function handleToolCall(req: JsonRpcRequest): Promise<Response> {
  const name = (req.params?.name as string) ?? ''
  const args = (req.params?.arguments as Record<string, unknown>) ?? {}

  if (!TOOL_MAP.has(name)) {
    return toolError(req.id!, `Unknown tool: ${name}`)
  }

  try {
    // Rate limit write tools — batch_post counts as N writes
    const agentId = (args.agent_id as string) ?? ''
    const isWrite = WRITE_TOOLS.has(name) || (name === 'sync' && args.wrap_up)
    const writeCount = name === 'batch_post' && Array.isArray(args.posts)
      ? args.posts.length : 1
    if (isWrite && agentId) {
      const limit = checkRateLimit(agentId, writeCount)
      if (!limit.allowed) {
        return toolError(
          req.id!,
          `Rate limit exceeded — max 20 writes/hour. Retry in ${Math.ceil(limit.retryAfterMs / 1000)}s`
        )
      }
    }
    const result = await dispatch(name, args)
    return toolOk(req.id!, result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return toolError(req.id!, msg)
  }
}

/** Calls the correct handler function by tool name. */
async function dispatch(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'sync': return handleSync(args as Parameters<typeof handleSync>[0])
    case 'post': return handlePost(args as Parameters<typeof handlePost>[0])
    case 'respond': return handleRespond(args as Parameters<typeof handleRespond>[0])
    case 'record_decision': return handleRecordDecision(args as Parameters<typeof handleRecordDecision>[0])
    case 'read_decisions': return handleReadDecisions(args as Parameters<typeof handleReadDecisions>[0])
    case 'read_post': return handleReadPost(args as Parameters<typeof handleReadPost>[0])
    case 'save_document': return handleSaveDocument(args as Parameters<typeof handleSaveDocument>[0])
    case 'list_documents': return handleListDocuments(args as Parameters<typeof handleListDocuments>[0])
    case 'get_document': return handleGetDocument(args as Parameters<typeof handleGetDocument>[0])
    case 'batch_post': return handleBatchPost(args as Parameters<typeof handleBatchPost>[0])
    default: throw new Error(`Unknown tool: ${name}`)
  }
}

/** MCP initialize response — declares tool capabilities. */
function initResult() {
  return {
    protocolVersion: '2025-03-26',
    capabilities: { tools: {} },
    serverInfo: { name: 'fleet-sync', version: '1.1.0' },
  }
}

/** Wraps a tool result in MCP content format. */
function toolOk(id: string | number, data: unknown): Response {
  return jsonRpcOk(id, {
    content: [{ type: 'text', text: JSON.stringify(data) }],
  })
}

/** Wraps a tool error in MCP content format (isError: true). */
function toolError(id: string | number, message: string): Response {
  return jsonRpcOk(id, {
    content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
    isError: true,
  })
}

/** JSON-RPC 2.0 success response. */
function jsonRpcOk(id: string | number, result: unknown): Response {
  return Response.json({ jsonrpc: '2.0', id, result })
}

/** JSON-RPC 2.0 error response. */
function jsonRpcError(id: string | number, code: number, message: string): Response {
  return Response.json({ jsonrpc: '2.0', id, error: { code, message } })
}
