import { NextResponse } from 'next/server';
import { writeRewindState, IDLE_STATE } from '../rewind-state-file';

export async function POST() {
  try {
    writeRewindState({ ...IDLE_STATE });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
