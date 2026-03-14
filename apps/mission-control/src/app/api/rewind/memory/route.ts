import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const REPO = '/Users/openclaw/university-peak-performance';

interface GitStatus {
  clean: boolean;
  branch: string;
  ahead: number;
  uncommitted: string[];
}

async function getGitStatus(): Promise<GitStatus> {
  try {
    const [statusOut, branchOut, aheadOut] = await Promise.all([
      execAsync('git status --porcelain', { cwd: REPO }),
      execAsync('git branch --show-current', { cwd: REPO }),
      execAsync('git rev-list --count @{u}..HEAD 2>/dev/null || echo 0', { cwd: REPO }),
    ]);
    const uncommitted = statusOut.stdout.trim().split('\n').filter(Boolean);
    return {
      clean: uncommitted.length === 0,
      branch: branchOut.stdout.trim(),
      ahead: parseInt(aheadOut.stdout.trim(), 10) || 0,
      uncommitted,
    };
  } catch {
    return { clean: true, branch: 'unknown', ahead: 0, uncommitted: [] };
  }
}

async function ensureRepoClean(): Promise<string[]> {
  const warnings: string[] = [];
  const status = await getGitStatus();

  if (status.branch !== 'main' && status.branch !== 'develop') {
    warnings.push(`On branch ${status.branch} — not main or develop`);
  }
  if (!status.clean) {
    warnings.push(`Uncommitted changes: ${status.uncommitted.join(', ')}`);
  }
  if (status.ahead > 0) {
    warnings.push(`${status.ahead} unpushed commit(s)`);
  }

  return warnings;
}

export async function POST() {
  const warnings = await ensureRepoClean();
  return NextResponse.json({ confirmed: true, warnings });
}

export async function GET() {
  const status = await getGitStatus();
  return NextResponse.json(status);
}
