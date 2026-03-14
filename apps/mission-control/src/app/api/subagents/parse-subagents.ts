export interface SubagentInfo {
  id: string;
  key: string;
  updatedAt: number;
  active: boolean;
}

export interface SubagentsData {
  count: number;
  subagents: SubagentInfo[];
}

const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

export function parseSubagentsOutput(rawJson: string, now = Date.now()): SubagentsData {
  const fallback: SubagentsData = { count: 0, subagents: [] };
  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') return fallback;

    const asObj = parsed as Record<string, unknown>;
    const sessions: Array<{ key?: string; updatedAt?: number }> =
      Array.isArray(asObj['sessions'])
        ? (asObj['sessions'] as Array<{ key?: string; updatedAt?: number }>)
        : Object.entries(asObj as Record<string, { updatedAt?: number }>).map(([key, val]) => ({ ...val, key }));

    const subagents: SubagentInfo[] = sessions
      .filter((s) => s.key?.includes('subagent'))
      .map((s) => {
        const key = s.key ?? '';
        const parts = key.split(':');
        const id = parts[parts.length - 1]?.slice(0, 8) ?? key.slice(-8);
        const updatedAt = s.updatedAt ?? 0;
        return { id, key, updatedAt, active: (now - updatedAt) < ACTIVE_WINDOW_MS };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);

    const count = subagents.filter((s) => s.active).length;
    return { count, subagents };
  } catch {
    return fallback;
  }
}
