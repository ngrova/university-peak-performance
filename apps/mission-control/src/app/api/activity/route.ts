import { NextResponse } from 'next/server';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const REPO_DIR = '/Users/openclaw/university-peak-performance';
const SESSIONS_FILE = '/Users/openclaw/.openclaw/agents/main/sessions/sessions.json';
const SUBAGENT_WINDOW_MS = 2 * 60 * 1000;

export interface ActivityResponse {
  app: string;
  task: string;
}

async function gitInfo(): Promise<{ subject: string; files: string }> {
  try {
    const [subjectResult, filesResult] = await Promise.all([
      execAsync('git log --format="%s" -1 2>/dev/null', { cwd: REPO_DIR, timeout: 5_000 }),
      execAsync('git show --stat --name-only HEAD --pretty=format:"" 2>/dev/null | grep "^apps/" | head -5', { cwd: REPO_DIR, timeout: 5_000 }),
    ]);
    return {
      subject: subjectResult.stdout.trim(),
      files: filesResult.stdout.trim(),
    };
  } catch {
    return { subject: '', files: '' };
  }
}

function detectApp(files: string): string {
  if (files.includes('apps/mission-control')) return 'Mission Control';
  if (files.includes('apps/thriving-mobile')) return 'Thriving Mobile';
  if (files.includes('apps/_archived-thriving-desktop')) return 'Thriving (Archived)';
  if (files.includes('apps/silver-trading')) return 'Silver Trading';
  return 'University of Peak Performance';
}

/** Strip conventional commit prefix and translate to plain English */
function humanizeCommit(subject: string): string {
  if (!subject) return 'Waiting for Nick';

  // Strip conventional commit prefix
  const stripped = subject
    .replace(/^(feat|fix|chore|docs|refactor|test|style|ci|perf|build)(\(.+?\))?!?:\s*/i, '')
    .replace(/^(WIP|wip):\s*/i, '');

  // Keyword translations — technical → plain
  const translations: Array<[RegExp, string]> = [
    [/segmented context bar.*/i, 'Segmented Context Meter'],
    [/thought bubble.*/i, 'Albus Thought Bubble'],
    [/status bar.*/i, 'RPG Status Bars'],
    [/auto.?reload.*/i, 'Memory Reset Auto-Reload'],
    [/refresh loop.*/i, 'Memory Reset Auto-Reload'],
    [/rewind.*/i, 'Memory Rewind'],
    [/transparent.*png|png.*transparent|sprite.*background|background.*sprite/i, 'Sprite Cleanup'],
    [/mix.blend/i, 'Sprite Cleanup'],
    [/sprite.*size|scale.*sprite/i, 'Sprite Sizing'],
    [/sprite.*position|anchor.*sprite|platform.*position/i, 'Sprite Placement'],
    [/thought bubble.*below|bubble.*lower/i, 'Thought Bubble Position'],
    [/font size/i, 'Font Size'],
    [/apprentice.*count|live.*count/i, 'Sub-Agent Display'],
    [/session.*token|token.*session|context.*gauge|parse.*session/i, 'Context Gauge'],
    [/rpg.*bar|status.*bar/i, 'RPG Status Bars'],
    [/CRUD|crud/i, 'Task Management'],
    [/auth|login|signup/i, 'Authentication'],
    [/deploy|vercel/i, 'Deployment'],
    [/test|spec/i, 'Tests'],
    [/CI|pipeline/i, 'CI Pipeline'],
    [/migration|schema/i, 'Database Schema'],
  ];

  for (const [pattern, replacement] of translations) {
    if (pattern.test(stripped)) return replacement;
  }

  // Title-case the stripped message as fallback
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
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

export async function GET(): Promise<NextResponse> {
  const [{ subject, files }] = await Promise.all([gitInfo()]);
  const subagents = activeSubagentCount();

  const app = detectApp(files) || 'Mission Control';
  let task = humanizeCommit(subject);

  if (subagents > 0) {
    task += ` (${subagents} agent${subagents > 1 ? 's' : ''} running)`;
  }

  // currentTask kept for backward compat with Room.tsx summarize()
  return NextResponse.json({ app, task, currentTask: task, lastAction: subject } satisfies ActivityResponse & { currentTask: string; lastAction: string });
}
