// ═══════════════════════════════════════════════════════════
// FILE: stats.ts
// PURPOSE: Computes human-centric stats from fleet data —
//   per-human accomplishments, active hours, post counts,
//   and decision counts for the scoreboard cards.
// CALLED BY: index.ts (the dashboard API entry point)
// DATA FLOW: agents + messages + decisions → agentMap →
//   per-human filtering → stats for Nick and Erin.
// ═══════════════════════════════════════════════════════════

export interface AgentInfo {
  display_name: string
  owner: string
  role: string
}

export interface HumanStats {
  posts: number
  decisions: number
  progress_count: number
  unique_agents: number
  active_start: string | null
  active_end: string | null
  accomplishments: Array<{ summary: string; via: string }>
  post_timestamps: string[]
}

/** Builds a lookup map from agent_id to display info. */
export function buildAgentMap(
  agents: Record<string, unknown>[]
): Record<string, AgentInfo> {
  const map: Record<string, AgentInfo> = {}
  for (const a of agents) {
    const id = a.agent_id as string
    map[id] = {
      display_name: (a.display_name as string) || id,
      owner: (a.owner as string) || 'unknown',
      role: (a.role as string) || '',
    }
  }
  return map
}

/** Returns agent_ids owned by a specific human. */
function getOwnedAgentIds(
  owner: string, agentMap: Record<string, AgentInfo>
): Set<string> {
  return new Set(
    Object.entries(agentMap)
      .filter(([, i]) => i.owner === owner || i.owner === 'both')
      .map(([id]) => id)
  )
}

/** Extracts accomplishments (progress + blocker_resolved posts). */
function extractWins(
  posts: Record<string, unknown>[], agentMap: Record<string, AgentInfo>
): Array<{ summary: string; via: string }> {
  return posts
    .filter(m => m.kind === 'progress' || m.kind === 'blocker_resolved')
    .map(m => ({
      summary: (m.summary as string) || '',
      via: agentMap[m.agent_id as string]?.display_name || (m.agent_id as string),
    }))
}

/** Computes stats for one human based on their agents' activity. */
function computeForHuman(
  owner: string,
  messages: Record<string, unknown>[],
  decisions: Record<string, unknown>[],
  agentMap: Record<string, AgentInfo>
): HumanStats {
  const ownedIds = getOwnedAgentIds(owner, agentMap)
  const myPosts = messages.filter(m => ownedIds.has(m.agent_id as string))
  const ts = myPosts.map(m => m.created_at as string).filter(Boolean).sort()
  const wins = extractWins(myPosts, agentMap)
  const decCount = decisions.filter(
    d => d.decided_by === owner || d.decided_by === 'both'
  ).length
  return {
    posts: myPosts.length, decisions: decCount,
    progress_count: wins.length,
    unique_agents: new Set(myPosts.map(m => m.agent_id as string)).size,
    active_start: ts[0] || null,
    active_end: ts[ts.length - 1] || null,
    accomplishments: wins, post_timestamps: ts,
  }
}

/** Computes human-centric dashboard stats for Nick and Erin. */
export function computeHumanDashboardStats(
  messages: Record<string, unknown>[],
  decisions: Record<string, unknown>[],
  agentMap: Record<string, AgentInfo>
): { nick: HumanStats; erin: HumanStats } {
  return {
    nick: computeForHuman('nick', messages, decisions, agentMap),
    erin: computeForHuman('erin', messages, decisions, agentMap),
  }
}
