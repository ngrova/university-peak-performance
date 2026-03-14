import { NextResponse } from 'next/server';
import { readRewindState } from '../rewind-state-file';

export async function GET() {
  try {
    const state = readRewindState();
    return NextResponse.json(state);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
