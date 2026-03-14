const TOKEN_CAP = 200_000;

export interface SessionData {
  tokens: number;
  cap: number;
  percent: number;
  systemTokens: number;   // cached/system tokens (cacheRead)
  convoTokens: number;    // conversation tokens added by user + assistant
}

interface SessionEntry {
  key?: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  cacheReadTokens?: number | null;
  totalTokensFresh?: boolean;
  updatedAt?: number;
  spawnDepth?: number;
  sessionFile?: string;
}

import fs from 'fs';

function tokenCount(s: SessionEntry): number {
  return s.totalTokens ?? s.inputTokens ?? 0;
}

function isMainSession(s: SessionEntry): boolean {
  const key = s.key ?? '';
  return !key.includes('subagent') && key !== 'agent:main:main';
}

function bestSession(sessions: SessionEntry[]): SessionEntry | null {
  const candidates = sessions.filter((s) => s.totalTokensFresh && isMainSession(s));
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0] ?? null;
}

/** Read the last usage entry from the session JSONL to get cacheRead breakdown */
function readCacheTokens(sessionFile: string): number {
  try {
    const content = fs.readFileSync(sessionFile, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim());
    // Walk backwards to find the last entry with usage.cacheRead
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lines[i]!) as { usage?: { cacheRead?: number } };
        if (typeof obj.usage?.cacheRead === 'number') {
          return obj.usage.cacheRead;
        }
      } catch { /* skip */ }
    }
  } catch { /* file missing or unreadable */ }
  return 0;
}

const FALLBACK: SessionData = { tokens: 0, cap: TOKEN_CAP, percent: 0, systemTokens: 0, convoTokens: 0 };

export function parseSessionOutput(rawJson: string): SessionData {
  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') return { ...FALLBACK };

    const asObj = parsed as Record<string, unknown>;
    let session: SessionEntry | null = null;

    if (Array.isArray(asObj['sessions'])) {
      session = bestSession(asObj['sessions'] as SessionEntry[]);
    } else {
      const entries = Object.entries(asObj as Record<string, SessionEntry>)
        .map(([key, val]) => ({ ...val, key }));
      session = bestSession(entries);
    }

    if (!session) return { ...FALLBACK };

    const tokens = tokenCount(session);
    const systemTokens = session.sessionFile ? readCacheTokens(session.sessionFile) : 0;
    const convoTokens = Math.max(0, tokens - systemTokens);
    const percent = Math.min(100, Math.round((tokens / TOKEN_CAP) * 100));

    return { tokens, cap: TOKEN_CAP, percent, systemTokens, convoTokens };
  } catch {
    return { ...FALLBACK };
  }
}
