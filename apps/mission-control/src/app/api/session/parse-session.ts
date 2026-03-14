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
  return s.inputTokens ?? s.totalTokens ?? 0;
}

function bestFromArray(sessions: SessionEntry[]): number {
  const fresh = sessions.filter((s) => s.totalTokensFresh && !s.spawnDepth);
  if (fresh.length === 0) return 0;
  const sorted = [...fresh].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return tokenCount(sorted[0]!);
}

function bestFromMap(map: Record<string, SessionEntry>): number {
  const entries = Object.values(map).filter(
    (s) => s.totalTokensFresh && !s.spawnDepth
  );
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
