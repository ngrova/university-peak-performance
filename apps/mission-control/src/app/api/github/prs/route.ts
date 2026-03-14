import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PrEntry { mergedAt: string }
interface PrsResponse { prsToday: number; prs: PrEntry[] }
const FALLBACK: PrsResponse = { prsToday: 0, prs: [] };

function isMergedToday(mergedAt: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return mergedAt.slice(0, 10) === today;
}

export async function GET(): Promise<NextResponse> {
  try {
    const { stdout } = await execAsync(
      'gh pr list --state merged --repo ngrova/university-peak-performance --json mergedAt --limit 50',
      { timeout: 15_000 }
    );
    const prs = (JSON.parse(stdout) as PrEntry[]).filter((p) => isMergedToday(p.mergedAt));
    return NextResponse.json({ prsToday: prs.length, prs });
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
