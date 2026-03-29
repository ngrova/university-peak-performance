// ═══════════════════════════════════════════════════════════
// FILE: tools-post.ts
// PURPOSE: MCP tool definitions for post and batch_post —
//   extracted from tools.ts to stay within file size limits.
//   Includes relay system fields for agent wake-up routing.
// CALLED BY: tools.ts (imported and spread into TOOLS array)
// DATA FLOW: Static definitions → merged into TOOLS array →
//   returned to MCP clients on tools/list.
// ═══════════════════════════════════════════════════════════

import { ToolDef } from './tools'

// Shared property definitions for relay fields
const RELAY_PROPERTIES = {
  relay_type: { type: 'string', enum: ['board_post', 'desk_drop', 'office_visit', 'reply'],
    description: 'Relay routing type — determines whether this message wakes the target agent' },
  chain_id: { type: 'string', format: 'uuid', description: 'Groups related messages into a relay chain' },
  depth: { type: 'number', default: 0, description: 'Current hop count in relay chain (max 6)' },
  reply_to: { type: 'string', format: 'uuid', description: 'Post ID this message responds to' },
  notify_self: { type: 'boolean', default: false, description: 'Include sender in inbox fanout' },
} as const

// prettier-ignore
const KIND_ENUM = ['progress','decision','insight','context','recommendation','question','warning','blocker','blocker_resolved']

/** Post tool — single message to the fleet stream. */
export const POST_TOOL: ToolDef = {
  name: 'post',
  description: 'Post a message to the fleet communication stream.',
  inputSchema: { type: 'object', required: ['agent_id', 'kind', 'summary'],
    properties: {
      agent_id: { type: 'string' }, kind: { type: 'string', enum: KIND_ENUM },
      summary: { type: 'string', description: 'Max 200 chars' },
      body: { type: 'string', description: 'Max 4000 chars' },
      tags: { type: 'array', items: { type: 'string' } },
      to_agent: { type: 'string' }, urgency: { type: 'string', enum: ['now','this-week','when-ready','fyi'] },
      thread_id: { type: 'string', format: 'uuid' },
      refs: { type: 'array', items: { type: 'string' } },
      idempotency_key: { type: 'string' },
      ...RELAY_PROPERTIES,
    } },
}

/** Batch post tool — multiple messages in one atomic operation. */
export const BATCH_POST_TOOL: ToolDef = {
  name: 'batch_post',
  description: 'Post multiple messages to the fleet stream in a single atomic operation. Max 20 posts.',
  inputSchema: { type: 'object', required: ['agent_id', 'posts'],
    properties: {
      agent_id: { type: 'string', description: 'Agent posting the batch' },
      posts: { type: 'array', maxItems: 20, items: { type: 'object', required: ['kind', 'summary'],
        properties: {
          kind: { type: 'string', enum: KIND_ENUM },
          summary: { type: 'string', description: 'Max 200 chars' },
          body: { type: 'string', description: 'Max 4000 chars' },
          tags: { type: 'array', items: { type: 'string' } },
          to_agent: { type: 'string' }, urgency: { type: 'string', enum: ['now','this-week','when-ready','fyi'] },
          thread_id: { type: 'string', format: 'uuid' },
          refs: { type: 'array', items: { type: 'string' } },
          idempotency_key: { type: 'string' },
          ...RELAY_PROPERTIES,
        } } } } },
}
