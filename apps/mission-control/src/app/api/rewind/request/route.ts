import { NextResponse } from 'next/server';
import { writeRewindState, IDLE_STATE } from '../rewind-state-file';

const HOOK_URL = 'http://127.0.0.1:18789/hooks/wake';
const HOOK_TOKEN = '9b4193b4adc389446c9974cc8272ae02';
const HOOK_BODY = {
  text: '⏪ Rewind requested from Mission Control. Respond in the dashboard at http://macmini:3001',
  mode: 'now',
};

async function notifyAgent(): Promise<void> {
  await fetch(HOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HOOK_TOKEN}`,
    },
    body: JSON.stringify(HOOK_BODY),
    signal: AbortSignal.timeout(5_000),
  });
}

export async function POST() {
  try {
    writeRewindState({
      ...IDLE_STATE,
      status: 'awaiting-agent',
      requestedAt: Date.now(),
    });

    // Fire-and-forget — don't let webhook failure block the response
    notifyAgent().catch(() => undefined);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
