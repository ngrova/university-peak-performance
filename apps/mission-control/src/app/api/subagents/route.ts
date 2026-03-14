import { NextResponse } from 'next/server';
import fs from 'fs';

const SESSIONS_FILE = '/Users/openclaw/.openclaw/agents/main/sessions/sessions.json';
const SUBAGENT_WINDOW_MS = 2 * 60 * 1000;

export async function GET() {
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as { sessions?: Array<{ key?: string; updatedAt?: number }> };
    const now = Date.now();
    const sessions = parsed.sessions ?? [];
    const count = sessions.filter(
      (s) => s.key?.includes('subagent') && (now - (s.updatedAt ?? 0)) < SUBAGENT_WINDOW_MS
    ).length;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
