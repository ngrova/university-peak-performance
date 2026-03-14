import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseSessionOutput } from '../../session/parse-session';

const execAsync = promisify(exec);
const FRESH_TOKEN_THRESHOLD = 5_000;

export async function POST() {
  try {
    const { stdout } = await execAsync('openclaw sessions --json', { timeout: 10_000 });
    const { tokens } = parseSessionOutput(stdout);
    const verified = tokens < FRESH_TOKEN_THRESHOLD;
    return NextResponse.json({ verified, tokens });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ verified: false, tokens: 0, error: msg }, { status: 500 });
  }
}
