const TOKEN_CAP = 200_000;

export interface SessionData {
  tokens: number;
  cap: number;
  percent: number;
  systemTokens: number;   // cached/system tokens (cacheRead)
  convoTokens: number;    // conversation tokens added by user + assistant
}

const SESSIONS_DIR = '/Users/openclaw/.openclaw/agents/main/sessions';

interface SessionEntry {
  key?: string;
  sessionId?: string;
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

/** Resolve session file path from sessionFile or sessionId */
function resolveSessionFile(session: SessionEntry): string | null {
  if (session.sessionFile) return session.sessionFile;
  if (session.sessionId) return `${SESSIONS_DIR}/${session.sessionId}.jsonl`;
  return null;
}

interface UsageBlock { input?: number; output?: number; cacheRead?: number; totalTokens?: number; }
interface JournalEntry { usage?: UsageBlock; message?: { usage?: UsageBlock } }

/** Read the last usage entry from the session JSONL.
 *  Returns { total, cached, fresh } where:
 *  - total   = cacheRead + input + output (real context window size)
 *  - cached  = cacheRead (system prompt + prior conversation, all cached)
 *  - fresh   = input (new tokens this turn — Nick's message + any uncached content)
 */
function readLastUsage(sessionFile: string): { total: number; cached: number; fresh: number } {
  const zero = { total: 0, cached: 0, fresh: 0 };
  try {
    const content = fs.readFileSync(sessionFile, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim());
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lines[i]!) as JournalEntry;
        const u = obj.usage ?? obj.message?.usage;
        if (u && typeof u.cacheRead === 'number' && u.cacheRead > 0) {
          const total = u.totalTokens ?? (u.cacheRead + (u.input ?? 0) + (u.output ?? 0));
          return { total, cached: u.cacheRead, fresh: u.input ?? 0 };
        }
      } catch { /* skip */ }
    }
  } catch { /* file missing */ }
  return zero;
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

    const resolvedFile = resolveSessionFile(session);
    const usage = resolvedFile ? readLastUsage(resolvedFile) : { total: 0, cached: 0, fresh: 0 };

    // Use JSONL total if available (more current than sessions.json totalTokens)
    const tokens = usage.total > 0 ? usage.total : tokenCount(session);
    const systemTokens = usage.cached;   // cached = system prompt + prior convo history
    const convoTokens = usage.fresh;     // fresh = new tokens this turn
    const percent = Math.min(100, Math.round((tokens / TOKEN_CAP) * 100));

    return { tokens, cap: TOKEN_CAP, percent, systemTokens, convoTokens };
  } catch {
    return { ...FALLBACK };
  }
}
