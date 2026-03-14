import fs from 'fs';
import { parseSessionOutput } from './parse-session';
import type { SessionData } from './parse-session';

const SESSIONS_FILE = '/Users/openclaw/.openclaw/agents/main/sessions/sessions.json';
const FALLBACK: SessionData = { tokens: 0, cap: 200_000, percent: 0, systemTokens: 0, convoTokens: 0, rewindSavings: 0, rewindSavingsPct: 0 };

export function readSessionData(): SessionData {
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return parseSessionOutput(raw);
  } catch {
    return FALLBACK;
  }
}

export type WatchCleanup = () => void;

export function watchSessionFile(onChange: (data: SessionData) => void): WatchCleanup {
  let watcher: fs.FSWatcher | null = null;

  try {
    watcher = fs.watch(SESSIONS_FILE, () => {
      const data = readSessionData();
      onChange(data);
    });

    watcher.on('error', () => {
      // File may not exist yet or watch failed — close silently
      watcher?.close();
      watcher = null;
    });
  } catch {
    // fs.watch() itself failed (file missing, permissions, etc.) — no-op
  }

  return () => {
    watcher?.close();
    watcher = null;
  };
}
