import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const HEALTH_URLS = ['http://localhost:3000/health', 'http://localhost:3000/api/health'];
const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 30_000;

async function pollHealth(): Promise<{ passed: boolean; elapsed: number }> {
  const start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    for (const url of HEALTH_URLS) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(1_500) });
        if (res.ok) return { passed: true, elapsed: Date.now() - start };
      } catch {
        // continue polling
      }
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return { passed: false, elapsed: Date.now() - start };
}

export async function POST() {
  try {
    await execAsync(
      'launchctl stop com.openclaw.gateway && sleep 2 && launchctl start com.openclaw.gateway',
      { timeout: 15_000 }
    );
    const { passed, elapsed } = await pollHealth();
    return NextResponse.json({ restarted: true, healthCheckPassed: passed, elapsed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ restarted: false, error: msg }, { status: 500 });
  }
}
