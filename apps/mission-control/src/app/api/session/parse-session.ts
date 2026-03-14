const TOKEN_CAP = 200_000;

export interface SessionData {
  tokens: number;
  cap: number;
  percent: number;
}

interface SessionEntry {
  key?: string;
  inputTokens?: number | null;
  totalTokens?: number | null;
  totalTokensFresh?: boolean;
  updatedAt?: number;
  spawnDepth?: number;
}

function tokenCount(s: SessionEntry): number {
  // totalTokens is the cumulative context window usage — prefer it over inputTokens
  return s.totalTokens ?? s.inputTokens ?? 0;
}

function isMainSession(s: SessionEntry): boolean {
  const key = s.key ?? '';
  // Exclude subagent sessions and the bare main session (no tokens)
  return !key.includes('subagent') && key !== 'agent:main:main';
}

function bestFromArray(sessions: SessionEntry[]): number {
  const candidates = sessions.filter(
    (s) => s.totalTokensFresh && isMainSession(s)
  );
  if (candidates.length === 0) return 0;
  const sorted = [...candidates].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return tokenCount(sorted[0]!);
}

function bestFromMap(map: Record<string, SessionEntry>): number {
  const entries = Object.entries(map)
    .map(([key, val]) => ({ ...val, key }))
    .filter((s) => s.totalTokensFresh && isMainSession(s));
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return tokenCount(sorted[0]!);
}

export function parseSessionOutput(rawJson: string): SessionData {
  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') {
      return { tokens: 0, cap: TOKEN_CAP, percent: 0 };
    }
    // CLI format: { sessions: SessionEntry[] }
    // File format: { [key: string]: SessionEntry }
    const asObj = parsed as Record<string, unknown>;
    const tokens = Array.isArray(asObj['sessions'])
      ? bestFromArray(asObj['sessions'] as SessionEntry[])
      : bestFromMap(asObj as Record<string, SessionEntry>);
    const percent = Math.min(100, Math.round((tokens / TOKEN_CAP) * 100));
    return { tokens, cap: TOKEN_CAP, percent };
  } catch {
    return { tokens: 0, cap: TOKEN_CAP, percent: 0 };
  }
}
