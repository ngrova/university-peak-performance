import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';

const SESSION_PATHS = [
  '/Users/openclaw/.openclaw/agents/main/sessions/sessions.json',
  '/Users/openclaw/.openclaw/sessions.json',
];

async function deleteFirstFound(paths: string[]): Promise<string | null> {
  for (const p of paths) {
    try {
      await unlink(p);
      return p;
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') throw err;
    }
  }
  return null;
}

export async function POST() {
  try {
    const deleted = await deleteFirstFound(SESSION_PATHS);
    return NextResponse.json({ cleared: true, path: deleted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ cleared: false, error: msg }, { status: 500 });
  }
}
