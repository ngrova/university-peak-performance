// ═══════════════════════════════════════════════════════════
// FILE: tools.ts
// PURPOSE: Defines the 6 MCP tools the fleet-sync server
//   exposes — their names, descriptions, and JSON Schema
//   input definitions. Used for tools/list responses and
//   for validating incoming tools/call requests.
// CALLED BY: router.ts
// DATA FLOW: Static definitions → returned to MCP clients
//   when they call tools/list.
// ═══════════════════════════════════════════════════════════

/** MCP tool definition shape */
export interface ToolDef {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

// prettier-ignore
export const TOOLS: ToolDef[] = [
  { name: 'sync', description: 'Register/update this agent and receive a briefing of recent fleet activity, open items, and unacknowledged decisions. Optionally close out a session with wrap_up.',
    inputSchema: { type: 'object', required: ['agent_id', 'display_name', 'role', 'owner', 'domain'],
      properties: {
        agent_id: { type: 'string', description: 'Unique agent identifier' },
        display_name: { type: 'string', description: 'Human-readable name' },
        role: { type: 'string', description: 'Agent role description' },
        owner: { type: 'string', enum: ['nick', 'erin', 'both'] },
        domain: { type: 'string', description: 'Primary domain of work' },
        current_focus: { type: 'string', description: 'What the agent is working on' },
        wrap_up: { type: 'object', description: 'Close-out data for ending a session',
          properties: { current_focus: { type: 'string' }, session_summary: { type: 'string' } },
          required: ['current_focus', 'session_summary'] } } } },
  { name: 'post', description: 'Post a message to the fleet communication stream.',
    inputSchema: { type: 'object', required: ['agent_id', 'kind', 'summary'],
      properties: {
        agent_id: { type: 'string' }, kind: { type: 'string', enum: ['progress','decision','insight','context','recommendation','question','warning','blocker','blocker_resolved'] },
        summary: { type: 'string', description: 'Max 200 chars' },
        body: { type: 'string', description: 'Max 4000 chars' },
        tags: { type: 'array', items: { type: 'string' } },
        to_agent: { type: 'string' }, urgency: { type: 'string', enum: ['now','this-week','when-ready','fyi'] },
        thread_id: { type: 'string', format: 'uuid' },
        refs: { type: 'array', items: { type: 'string' } },
        idempotency_key: { type: 'string' } } } },
  { name: 'respond', description: 'Resolve an open item directed to you.',
    inputSchema: { type: 'object', required: ['post_id', 'resolution_status', 'resolution_note', 'resolved_by'],
      properties: {
        post_id: { type: 'string', format: 'uuid' },
        resolution_status: { type: 'string', enum: ['accepted','rejected','discussed'] },
        resolution_note: { type: 'string' },
        resolved_by: { type: 'string' } } } },
  { name: 'record_decision', description: 'Record a permanent fleet decision.',
    inputSchema: { type: 'object', required: ['decision', 'reasoning', 'decided_by', 'domain'],
      properties: {
        decision: { type: 'string' }, reasoning: { type: 'string' },
        decided_by: { type: 'string' }, domain: { type: 'string' },
        affects_agents: { type: 'array', items: { type: 'string' } },
        supersedes: { type: 'string', format: 'uuid' },
        source_thread_id: { type: 'string', format: 'uuid' },
        idempotency_key: { type: 'string' } } } },
  { name: 'read_decisions', description: 'Query fleet decisions with optional filters.',
    inputSchema: { type: 'object', properties: {
        domain: { type: 'string' }, status: { type: 'string', enum: ['active','superseded','reversed'] },
        affects_agent: { type: 'string' }, limit: { type: 'number', default: 50 } } } },
  { name: 'read_post', description: 'Read a full post and its thread history.',
    inputSchema: { type: 'object', required: ['post_id'],
      properties: { post_id: { type: 'string', format: 'uuid' } } } },
]

/** Quick lookup by tool name */
export const TOOL_MAP = new Map(TOOLS.map((t) => [t.name, t]))
