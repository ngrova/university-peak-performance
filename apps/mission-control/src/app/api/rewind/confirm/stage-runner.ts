import { exec } from 'child_process';
import { promisify } from 'util';
import { unlink } from 'fs/promises';
import { readRewindState, writeRewindState } from '../rewind-state-file';
import type { RewindStateFile } from '../rewind-state-file';

const execAsync = promisify(exec);
const SESSIONS_FILE = '/Users/openclaw/.openclaw/agents/main/sessions/sessions.json';
const HEALTH_POLL_MS = 2_000;
const HEALTH_TIMEOUT_MS = 30_000;
const FRESH_TOKEN_THRESHOLD = 5_000;

function updateStage(stage: keyof RewindStateFile['stages'], status: RewindStateFile['stages'][typeof stage]): void {
  const current = readRewindState();
  writeRewindState({ ...current, stages: { ...current.stages, [stage]: status } });
}

async function runClear(): Promise<void> {
  updateStage('clear', 'running');
  await unlink(SESSIONS_FILE).catch((err: NodeJS.ErrnoException) => {
    if (err.code !== 'ENOENT') throw err;
  });
  updateStage('clear', 'done');
}

async function pollHealth(): Promise<boolean> {
  const start = Date.now();
  const urls = ['http://localhost:3000/health', 'http://localhost:3000/api/health'];
  while (Date.now() - start < HEALTH_TIMEOUT_MS) {
    for (const url of urls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(1_500) });
        if (res.ok) return true;
      } catch { /* continue */ }
    }
    await new Promise((r) => setTimeout(r, HEALTH_POLL_MS));
  }
  return false;
}

async function runRestart(): Promise<void> {
  updateStage('restart', 'running');
  await execAsync('launchctl stop com.openclaw.gateway && sleep 2 && launchctl start com.openclaw.gateway', { timeout: 15_000 });
  await pollHealth();
  updateStage('restart', 'done');
}

async function runVerify(): Promise<void> {
  updateStage('verify', 'running');
  const { stdout } = await execAsync('openclaw sessions --json', { timeout: 10_000 });
  const parsed = JSON.parse(stdout) as { tokens?: number };
  if ((parsed.tokens ?? Infinity) >= FRESH_TOKEN_THRESHOLD) {
    throw new Error(`Token count ${parsed.tokens ?? '?'} still above threshold`);
  }
  updateStage('verify', 'done');
}

export async function runStages(): Promise<void> {
  const startState = readRewindState();
  writeRewindState({ ...startState, status: 'running', confirmedAt: Date.now() });

  const stageRunners = [runClear, runRestart, runVerify] as const;
  const stageNames = ['clear', 'restart', 'verify'] as const;

  for (let i = 0; i < stageRunners.length; i++) {
    try {
      await stageRunners[i]();
    } catch (err) {
      const failState = readRewindState();
      const msg = err instanceof Error ? err.message : 'Unknown error';
      writeRewindState({ ...failState, status: 'failed', stages: { ...failState.stages, [stageNames[i]]: 'failed' } });
      throw new Error(`Stage ${stageNames[i]} failed: ${msg}`);
    }
  }

  const finalState = readRewindState();
  writeRewindState({ ...finalState, status: 'done' });
}
