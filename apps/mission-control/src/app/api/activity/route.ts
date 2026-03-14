import { NextResponse } from 'next/server';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const REPO_DIR = '/Users/openclaw/university-peak-performance';
const SESSIONS_FILE = '/Users/openclaw/.openclaw/agents/main/sessions/sessions.json';
const SUBAGENT_WINDOW_MS = 2 * 60 * 1000;

interface ActivityResponse {
  currentTask: string;
  lastAction: string;
}

async function lastCommitMessage(): Promise<string> {
  try {
    const { stdout } = await execAsync(
      'git log --format="%s" -1 2>/dev/null',
      { cwd: REPO_DIR, timeout: 5_000 }
    );
    return stdout.trim() || '—';
  } catch {
    return '—';
  }
}

function activeSubagentCount(): number {
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as { sessions?: Array<{ key?: string; updatedAt?: number }> };
    const now = Date.now();
    return (parsed.sessions ?? []).filter(
      (s) => s.key?.includes('subagent') && (now - (s.updatedAt ?? 0)) < SUBAGENT_WINDOW_MS
    ).length;
  } catch {
    return 0;
  }
}

/** Derive a human-readable thought from the last commit subject line.
 *  Strips conventional commit prefixes and formats it naturally. */
function deriveThought(commitMsg: string, subagents: number): string {
  if (commitMsg === '—' || !commitMsg) {
    return subagents > 0 ? `Spawning ${subagents} sub-agent${subagents > 1 ? 's' : ''}...` : 'Waiting for Nick...';
  }

  // Strip conventional commit prefix (feat:, fix:, chore:, etc.)
  const stripped = commitMsg.replace(/^(feat|fix|chore|docs|refactor|test|style|ci|perf|build)(\(.+?\))?:\s*/i, '');

  if (subagents > 0) {
    return `Working on: ${stripped} (${subagents} sub-agent${subagents > 1 ? 's' : ''} active)`;
  }

  return `Working on: ${stripped}`;
}

export async function GET(): Promise<NextResponse> {
  const [commitMsg] = await Promise.all([lastCommitMessage()]);
  const subagents = activeSubagentCount();
  const currentTask = deriveThought(commitMsg, subagents);

  return NextResponse.json({ currentTask, lastAction: commitMsg } satisfies ActivityResponse);
}
