import { NextResponse } from 'next/server';
import { runStages } from './stage-runner';

export async function POST() {
  // Fire-and-forget — stages update the state file incrementally
  runStages().catch(() => undefined);
  return NextResponse.json({ ok: true });
}
