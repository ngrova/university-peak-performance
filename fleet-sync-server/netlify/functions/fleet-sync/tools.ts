// ═══════════════════════════════════════════════════════════
// FILE: tools.ts
// PURPOSE: Defines the 10 MCP tools the fleet-sync server
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
  { name: 'save_document', description: 'Save a document to fleet storage for sharing between agents. Supports up to 100,000 characters.',
    inputSchema: { type: 'object', required: ['agent_id', 'title', 'content'],
      properties: {
        agent_id: { type: 'string', description: 'Agent saving the document' },
        title: { type: 'string', description: 'Document title, max 200 chars' },
        content: { type: 'string', description: 'Document content, max 100000 chars' },
        description: { type: 'string', description: 'Brief description, max 500 chars' },
        file_type: { type: 'string', enum: ['text/markdown','text/plain','application/json','text/csv','text/html'], default: 'text/markdown' },
        tags: { type: 'array', items: { type: 'string' } },
        for_agents: { type: 'array', items: { type: 'string' }, description: 'Target agent IDs — empty means all agents' },
        thread_id: { type: 'string', format: 'uuid', description: 'Link to an existing message thread' },
        idempotency_key: { type: 'string' } } } },
  { name: 'list_documents', description: 'Browse fleet documents by metadata — returns titles and tags, not content.',
    inputSchema: { type: 'object', properties: {
        tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags (all must match)' },
        agent_id: { type: 'string', description: 'Filter by author agent' },
        for_agent: { type: 'string', description: 'Filter by target agent (includes broadcast docs)' },
        title_search: { type: 'string', description: 'Case-insensitive title search' },
        limit: { type: 'number', default: 20, description: 'Max results (up to 50)' } } } },
  { name: 'get_document', description: 'Fetch a document with full content. Supports partial reads via offset/length.',
    inputSchema: { type: 'object', required: ['document_id'],
      properties: {
        document_id: { type: 'string', format: 'uuid' },
        offset: { type: 'number', description: 'Character offset to start reading from (default 0)' },
        length: { type: 'number', description: 'Number of characters to return (default: all)' } } } },
  { name: 'batch_post', description: 'Post multiple messages to the fleet stream in a single atomic operation. Max 20 posts.',
    inputSchema: { type: 'object', required: ['agent_id', 'posts'],
      properties: {
        agent_id: { type: 'string', description: 'Agent posting the batch' },
        posts: { type: 'array', maxItems: 20, items: { type: 'object', required: ['kind', 'summary'],
          properties: {
            kind: { type: 'string', enum: ['progress','decision','insight','context','recommendation','question','warning','blocker','blocker_resolved'] },
            summary: { type: 'string', description: 'Max 200 chars' },
            body: { type: 'string', description: 'Max 4000 chars' },
            tags: { type: 'array', items: { type: 'string' } },
            to_agent: { type: 'string' }, urgency: { type: 'string', enum: ['now','this-week','when-ready','fyi'] },
            thread_id: { type: 'string', format: 'uuid' },
            refs: { type: 'array', items: { type: 'string' } },
            idempotency_key: { type: 'string' } } } } } } },
]

/** Quick lookup by tool name */
export const TOOL_MAP = new Map(TOOLS.map((t) => [t.name, t]))
