'use client';

import { useCallback, useEffect, useState } from 'react';
import { ContextGauge } from './components/ContextGauge';
import { RewindButton } from './components/RewindButton';
import { AgentChat } from './components/AgentChat';
import type { RewindStateFile } from './api/rewind/rewind-state-file';

const IDLE_STATE: RewindStateFile = {
  status: 'idle',
  agentMessage: null,
  requestedAt: null,
  confirmedAt: null,
  stages: { memory: 'idle', clear: 'idle', restart: 'idle', verify: 'idle' },
};

async function postRoute(path: string, body?: object): Promise<void> {
  await fetch(path, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

export default function MissionControlPage() {
  const [rewindState, setRewindState] = useState<RewindStateFile>(IDLE_STATE);

  useEffect(() => {
    const source = new EventSource('/api/rewind/state/stream');
    source.onmessage = (e) => {
      try { setRewindState(JSON.parse(e.data as string) as RewindStateFile); } catch { /* ignore */ }
    };
    return () => source.close();
  }, []);

  const handleRewind = useCallback(async () => {
    await postRoute('/api/rewind/request');
  }, []);

  const handleHardRewind = useCallback(async () => {
    await postRoute('/api/rewind/confirm');
  }, []);

  const handleConfirm = useCallback(async () => {
    await postRoute('/api/rewind/confirm');
  }, []);

  const handleCancel = useCallback(async () => {
    await postRoute('/api/rewind/cancel');
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-12 px-4">
      <div className="w-full max-w-[480px] flex flex-col gap-10">
        <header>
          <h1 className="text-xs font-sans uppercase tracking-widest text-[#E5E5E5]/40">Mission Control</h1>
        </header>
        <ContextGauge />
        <RewindButton
          status={rewindState.status}
          onRewind={() => void handleRewind()}
          onHardRewind={() => void handleHardRewind()}
        />
        <AgentChat
          state={rewindState}
          onConfirm={() => void handleConfirm()}
          onCancel={() => void handleCancel()}
        />
      </div>
    </main>
  );
}
