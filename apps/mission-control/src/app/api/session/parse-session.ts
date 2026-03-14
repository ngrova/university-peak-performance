const TOKEN_CAP = 200_000;

export interface SessionData {
  tokens: number;
  cap: number;
  percent: number;
}

interface RawSession {
  totalTokens?: number | null;
  totalTokensFresh?: boolean;
  key?: string;
  updatedAt?: number;
}

interface RawSessionsJson {
  sessions?: RawSession[];
}

function extractTokensFromSessions(sessions: RawSession[]): number {
  const fresh = sessions.filter((s) => s.totalTokensFresh && s.totalTokens != null);
  if (fresh.length === 0) return 0;
  const sorted = [...fresh].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return sorted[0]?.totalTokens ?? 0;
}

export function parseSessionOutput(rawJson: string): SessionData {
  try {
    const parsed: unknown = JSON.parse(rawJson);
    const data = parsed as RawSessionsJson;
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    const tokens = extractTokensFromSessions(sessions);
    const percent = Math.min(100, Math.round((tokens / TOKEN_CAP) * 100));
    return { tokens, cap: TOKEN_CAP, percent };
  } catch {
    return { tokens: 0, cap: TOKEN_CAP, percent: 0 };
  }
}
