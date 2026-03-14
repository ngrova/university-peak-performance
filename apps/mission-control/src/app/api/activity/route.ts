import { NextResponse } from 'next/server';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const MEMORY_DIR = '/Users/openclaw/.openclaw/workspace/memory';
const REPO_DIR = '/Users/openclaw/university-peak-performance';

interface ActivityResponse {
  currentTask: string;
  lastAction: string;
}

function todayFile(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${MEMORY_DIR}/${y}-${m}-${day}.md`;
}

function extractMemoryLines(filePath: string): string {
  try {
    const lines = fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 2 && !l.startsWith('#'));
    return lines.at(-1) ?? 'Idle';
  } catch {
    return 'Idle';
  }
}

async function gitLog(): Promise<string> {
  try {
    const { stdout } = await execAsync(
      'git log --oneline -1 2>/dev/null',
      { cwd: REPO_DIR, timeout: 5_000 }
    );
    return stdout.trim().slice(0, 40) || '—';
  } catch {
    return '—';
  }
}

export async function GET(): Promise<NextResponse> {
  const [currentTask, lastAction] = await Promise.all([
    Promise.resolve(extractMemoryLines(todayFile())),
    gitLog(),
  ]);
  return NextResponse.json({ currentTask, lastAction } satisfies ActivityResponse);
}
