import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const REPO_DIR = '/Users/openclaw/university-peak-performance';

export interface LogEntry {
  id: string;
  ago: string;
  action: string;
  type: 'merge' | 'push' | 'work' | 'read' | 'spawn' | 'test';
  timestamp: number;
}

export interface ActivityLogData {
  entries: LogEntry[];
}

interface GitCommit {
  hash: string;
  subject: string;
  timestamp: number;
  refs: string;
}

function parseType(subject: string, refs: string): LogEntry['type'] {
  const s = subject.toLowerCase();
  if (refs.includes('origin/') || s.includes('merge pull request') || s.includes('merged')) return 'merge';
  if (s.includes('test') || s.includes('spec') || s.includes('vitest') || s.includes('passing')) return 'test';
  if (s.includes('read') || s.includes('check') || s.includes('review')) return 'read';
  if (s.includes('spawn') || s.includes('subagent') || s.includes('agent')) return 'spawn';
  if (s.startsWith('feat') || s.startsWith('fix') || s.startsWith('chore') || s.startsWith('refactor')) return 'work';
  return 'push';
}

function humanize(subject: string): string {
  // Strip conventional prefix
  const s = subject
    .replace(/^(feat|fix|chore|docs|refactor|test|style|ci|perf|build)(\(.+?\))?!?:\s*/i, '')
    .replace(/\s*\(#\d+\)\s*$/, '');

  // Truncate long messages
  return s.length > 52 ? s.slice(0, 49) + '…' : s;
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export async function GET(): Promise<NextResponse<ActivityLogData>> {
  try {
    // Git log: last 48h, all branches
    const { stdout } = await execAsync(
      `git log --all --format="%H|%s|%at|%D" --since="48 hours ago" --max-count=20`,
      { cwd: REPO_DIR, timeout: 8_000 }
    );

    const entries: LogEntry[] = stdout
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [hash, subject, atStr, refs] = line.split('|');
        const timestamp = parseInt(atStr ?? '0', 10) * 1000;
        const action = humanize(subject ?? '');
        const type = parseType(subject ?? '', refs ?? '');
        return {
          id: (hash ?? '').slice(0, 8),
          ago: timeAgo(timestamp),
          action,
          type,
          timestamp,
        };
      })
      .filter((e) => e.action.length > 0)
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}
