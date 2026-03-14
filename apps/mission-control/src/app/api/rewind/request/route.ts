import { NextResponse } from 'next/server';
import { writeRewindState, IDLE_STATE } from '../rewind-state-file';

// Skip the agent handshake — go straight to awaiting-confirm so the
// user can immediately proceed without waiting for an agent response.
// The hook-based agent notification was unreliable: the agent only
// responds when actively chatting, not when a background hook fires.

export async function POST() {
  try {
    writeRewindState({
      ...IDLE_STATE,
      status: 'awaiting-confirm',
      requestedAt: Date.now(),
      agentMessage: 'Ready to rewind. This will clear session history and restart the gateway.',
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
