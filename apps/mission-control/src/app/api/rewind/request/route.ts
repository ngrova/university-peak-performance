import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeRewindState, IDLE_STATE } from '../rewind-state-file';

const execAsync = promisify(exec);
const REPO = '/Users/openclaw/university-peak-performance';

async function buildConfirmMessage(): Promise<string> {
  const lines: string[] = ['Ready to rewind. This will clear session history and restart the gateway.', ''];

  try {
    const [statusOut, branchOut, logOut] = await Promise.all([
      execAsync('git status --porcelain', { cwd: REPO, timeout: 5_000 }),
      execAsync('git branch --show-current', { cwd: REPO, timeout: 5_000 }),
      execAsync('git log --oneline -3', { cwd: REPO, timeout: 5_000 }),
    ]);

    const branch = branchOut.stdout.trim();
    const uncommitted = statusOut.stdout.trim().split('\n').filter(Boolean);
    const recentLog = logOut.stdout.trim();

    lines.push(`Branch: ${branch}`);
    lines.push(`Recent commits:\n${recentLog}`);

    if (uncommitted.length > 0) {
      lines.push('');
      lines.push(`⚠️  UNCOMMITTED CHANGES (${uncommitted.length} files):`);
      uncommitted.slice(0, 5).forEach(l => lines.push(`  ${l}`));
      if (uncommitted.length > 5) lines.push(`  ...and ${uncommitted.length - 5} more`);
      lines.push('');
      lines.push('Commit or stash before proceeding?');
    } else {
      lines.push('✓ Repo is clean — safe to rewind.');
    }
  } catch {
    lines.push('(Could not read git status)');
  }

  return lines.join('\n');
}

export async function POST() {
  try {
    const agentMessage = await buildConfirmMessage();
    writeRewindState({
      ...IDLE_STATE,
      status: 'awaiting-confirm',
      requestedAt: Date.now(),
      agentMessage,
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
