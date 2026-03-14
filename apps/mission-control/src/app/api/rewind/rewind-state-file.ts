import fs from 'fs';
import path from 'path';

const STATE_PATH = '/Users/openclaw/.openclaw/mission-control/rewind-state.json';

export type StageStatus = 'idle' | 'running' | 'done' | 'failed';
export type RewindStatus = 'idle' | 'awaiting-agent' | 'awaiting-confirm' | 'running' | 'done' | 'failed';

export interface RewindStateFile {
  status: RewindStatus;
  agentMessage: string | null;
  requestedAt: number | null;
  confirmedAt: number | null;
  stages: {
    memory: StageStatus;
    clear: StageStatus;
    restart: StageStatus;
    verify: StageStatus;
  };
}

export const IDLE_STATE: RewindStateFile = {
  status: 'idle',
  agentMessage: null,
  requestedAt: null,
  confirmedAt: null,
  stages: { memory: 'idle', clear: 'idle', restart: 'idle', verify: 'idle' },
};

export function readRewindState(): RewindStateFile {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf-8');
    return JSON.parse(raw) as RewindStateFile;
  } catch {
    return { ...IDLE_STATE };
  }
}

export function writeRewindState(state: RewindStateFile): void {
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export function watchRewindState(onChange: (state: RewindStateFile) => void): () => void {
  let watcher: fs.FSWatcher | null = null;
  try {
    watcher = fs.watch(STATE_PATH, () => onChange(readRewindState()));
    watcher.on('error', () => { watcher?.close(); watcher = null; });
  } catch {
    // file missing or watch failed — no-op
  }
  return () => { watcher?.close(); watcher = null; };
}
