import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const GATEWAY_URL = 'http://127.0.0.1:18789';
const WORKSPACE = '/Users/openclaw/.openclaw/workspace';
const REPO = '/Users/openclaw/university-peak-performance';
const POLL_MS = 3_000;
const TIMEOUT_MS = 120_000;

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getGatewayToken(): Promise<string> {
  const cfg = JSON.parse(fs.readFileSync('/Users/openclaw/.openclaw/openclaw.json', 'utf-8')) as {
    gateway?: { auth?: { token?: string } };
  };
  return cfg.gateway?.auth?.token ?? '';
}

async function sendToAgent(token: string, message: string): Promise<void> {
  await fetch(`${GATEWAY_URL}/tools/invoke`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool: 'sessions_send',
      args: { sessionKey: 'agent:main:main', message },
    }),
  });
}

async function waitForMemoryFile(token: string): Promise<boolean> {
  const date = todayDateStr();
  const memFile = path.join(WORKSPACE, 'memory', `${date}.md`);
  const start = Date.now();
  let notified = false;

  while (Date.now() - start < TIMEOUT_MS) {
    if (fs.existsSync(memFile)) {
      const stat = fs.statSync(memFile);
      if (stat.mtimeMs > start) return true; // updated since we started
    }
    if (!notified && Date.now() - start > 30_000) {
      await sendToAgent(token, `⏳ Still waiting for memory flush before rewind...`);
      notified = true;
    }
    await new Promise(r => setTimeout(r, POLL_MS));
  }
  return false;
}

async function getGitStatus(): Promise<{ clean: boolean; branch: string; warnings: string[] }> {
  const warnings: string[] = [];
  try {
    const [statusOut, branchOut] = await Promise.all([
      execAsync('git status --porcelain', { cwd: REPO, timeout: 5_000 }),
      execAsync('git branch --show-current', { cwd: REPO, timeout: 5_000 }),
    ]);
    const branch = branchOut.stdout.trim();
    const uncommitted = statusOut.stdout.trim().split('\n').filter(Boolean);
    if (branch !== 'main' && branch !== 'develop') warnings.push(`On branch ${branch}`);
    if (uncommitted.length > 0) warnings.push(`${uncommitted.length} uncommitted file(s)`);
    return { clean: uncommitted.length === 0, branch, warnings };
  } catch {
    return { clean: true, branch: 'unknown', warnings: [] };
  }
}

const FLUSH_PROMPT = `Pre-compaction memory flush. Store durable memories only in memory/${todayDateStr()}.md (create memory/ if needed). Treat workspace bootstrap/reference files such as MEMORY.md, SOUL.md, TOOLS.md, and AGENTS.md as read-only during this flush; never overwrite, replace, or edit them. If memory/${todayDateStr()}.md already exists, APPEND new content only and do not overwrite existing entries. Do NOT create timestamped variant files (e.g., ${todayDateStr()}-HHMM.md); always use the canonical ${todayDateStr()}.md filename. If nothing to store, reply with NO_REPLY.\nCurrent time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })} (America/Los_Angeles)`;

export async function POST() {
  try {
    const token = await getGatewayToken();
    const git = await getGitStatus();

    // Send memory flush prompt to agent
    await sendToAgent(token, FLUSH_PROMPT);

    // Wait for the daily memory file to be written/updated
    const flushed = await waitForMemoryFile(token);

    if (!flushed) {
      return NextResponse.json({
        ok: false,
        error: 'Memory flush timed out — agent did not write memory file within 2 minutes',
        git,
      }, { status: 408 });
    }

    return NextResponse.json({ ok: true, flushed: true, git });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
