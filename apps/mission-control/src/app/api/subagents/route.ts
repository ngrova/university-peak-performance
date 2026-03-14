import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseSubagentsOutput } from './parse-subagents';

export type { SubagentInfo, SubagentsData } from './parse-subagents';

const execAsync = promisify(exec);
const FALLBACK = { count: 0, subagents: [] };

export async function GET() {
  try {
    const { stdout } = await execAsync('openclaw sessions --json', { timeout: 10_000 });
    return NextResponse.json(parseSubagentsOutput(stdout));
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
