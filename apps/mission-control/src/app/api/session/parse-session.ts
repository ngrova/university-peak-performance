const TOKEN_CAP = 200_000;

export interface SessionData {
  tokens: number;
  cap: number;
  percent: number;
  systemTokens: number;   // cached/system tokens (cacheRead)
  convoTokens: number;    // fresh tokens this turn
  rewindSavings: number;  // tokens freed by a rewind (tokens - coldStartTokens)
  rewindSavingsPct: number; // rewindSavings as % of cap
  outputTokens: number;   // total output tokens this session
  messageCount: number;   // number of exchanges in session
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
interface JournalEntry { usage?: UsageBlock; message?: { usage?: UsageBlock }; type?: string }

/** Read usage from the session JSONL.
 *  Returns last entry (highest totalTokens in recent lines) plus cold-start total.
 */
function readUsage(sessionFile: string): { total: number; cached: number; fresh: number; coldStart: number; output: number; messageCount: number } {
  const zero = { total: 0, cached: 0, fresh: 0, coldStart: 0, output: 0, messageCount: 0 };
  try {
    const content = fs.readFileSync(sessionFile, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim());

    // Find cold-start: first usage entry with totalTokens > 0
    let coldStart = 0;
    let messageCount = 0;
    let lastOutput = 0;
    for (const line of lines) {
      try {
        const obj = JSON.parse(line) as JournalEntry;
        const u = obj.usage ?? obj.message?.usage;
        if (u && (u.totalTokens ?? 0) > 0) {
          if (coldStart === 0) coldStart = u.totalTokens ?? 0;
          if ((u.output ?? 0) > 0) lastOutput = u.output ?? 0;
        }
        if (obj.type === 'user') messageCount++;
      } catch { /* skip */ }
    }

    // Find best recent entry (highest totalTokens in last 30 lines)
    const candidates: Array<{ total: number; cached: number; fresh: number; output: number }> = [];
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 30); i--) {
      try {
        const obj = JSON.parse(lines[i]!) as JournalEntry;
        const u = obj.usage ?? obj.message?.usage;
        if (!u) continue;
        const total = u.totalTokens ?? 0;
        const cached = u.cacheRead ?? 0;
        if (total > 0 && cached > 0) candidates.push({ total, cached, fresh: u.input ?? 0, output: u.output ?? 0 });
      } catch { /* skip */ }
    }

    if (candidates.length === 0) return { ...zero, coldStart, output: lastOutput, messageCount };
    candidates.sort((a, b) => b.total - a.total);
    return { ...candidates[0]!, coldStart, messageCount };
  } catch { /* file missing */ }
  return zero;
}

const FALLBACK: SessionData = { tokens: 0, cap: TOKEN_CAP, percent: 0, systemTokens: 0, convoTokens: 0, rewindSavings: 0, rewindSavingsPct: 0, outputTokens: 0, messageCount: 0 };

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
    const usage = resolvedFile ? readUsage(resolvedFile) : { total: 0, cached: 0, fresh: 0, coldStart: 0, output: 0, messageCount: 0 };

    const tokens = usage.total > 0 ? usage.total : tokenCount(session);
    const systemTokens = usage.cached;
    const convoTokens = usage.fresh;
    const rewindSavings = Math.max(0, tokens - usage.coldStart);
    const rewindSavingsPct = Math.min(100, Math.round((rewindSavings / TOKEN_CAP) * 100));
    const percent = Math.min(100, Math.round((tokens / TOKEN_CAP) * 100));
    const outputTokens = usage.output;
    const messageCount = usage.messageCount;

    return { tokens, cap: TOKEN_CAP, percent, systemTokens, convoTokens, rewindSavings, rewindSavingsPct, outputTokens, messageCount };
  } catch {
    return { ...FALLBACK };
  }
}
