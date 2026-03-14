import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseSessionOutput } from './parse-session';

const execAsync = promisify(exec);
const FALLBACK = { tokens: 0, cap: 200_000, percent: 0 };

export async function GET() {
  try {
    const { stdout } = await execAsync('openclaw sessions --json', {
      timeout: 10_000,
    });
    const data = parseSessionOutput(stdout);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
