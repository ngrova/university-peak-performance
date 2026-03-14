import { NextResponse } from 'next/server';
import { readRewindState, writeRewindState } from '../rewind-state-file';

interface AgentRespondBody {
  message: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as AgentRespondBody;

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({ ok: false, error: 'message is required' }, { status: 400 });
    }

    const current = readRewindState();
    writeRewindState({
      ...current,
      status: 'awaiting-confirm',
      agentMessage: body.message,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
