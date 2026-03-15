'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Room } from './components/Room';
import { TopStrip } from './components/TopStrip';
import { ActivityStrip } from './components/ActivityStrip';
import { RewindPanel } from './components/RewindPanel';
import { AlbusSprite } from './components/AlbusSprite';
import { ThoughtBubble } from './components/ThoughtBubble';
import { albusState } from './components/sprite-state';
import { useMetricsSync } from './hooks/useMetricsSync';
import { usePoll } from './hooks/usePoll';
import type { RewindStateFile } from './api/rewind/rewind-state-file';
import type { ActivityLogData } from './api/activity-log/route';
import type { SessionData, SpendData } from './components/TopStrip';

interface ActivityData {
  app: string;
  task: string;
  lastCommitAt?: string;
}

const IDLE_REWIND: RewindStateFile = {
  status: 'idle',
  agentMessage: null,
  requestedAt: null,
  confirmedAt: null,
  stages: { memory: 'idle', clear: 'idle', restart: 'idle', verify: 'idle' },
};

export default function LookoutPage() {
  const session = usePoll<SessionData>('/api/session', 30_000, {
    tokens: 0,
    cap: 200_000,
    percent: 0,
    outputTokens: 0,
    messageCount: 0,
    systemTokens: 0,
    convoTokens: 0,
    rewindSavings: 0,
    rewindSavingsPct: 0,
  });
  const spend = usePoll<SpendData>('/api/spend', 60_000, { usage: 0, usageToday: 0 });
  const activity = usePoll<ActivityData>('/api/activity', 15_000, { app: 'Mission Control', task: '' });
  const activityLog = usePoll<ActivityLogData>('/api/activity-log', 60_000, { entries: [] });
  const rewind = usePoll<RewindStateFile>('/api/rewind/state', 5_000, IDLE_REWIND);

  const today = new Date().toISOString().slice(0, 10);

  const prevOutputRef = useRef(0);
  const aState = albusState(prevOutputRef.current, session.outputTokens);
  useEffect(() => {
    prevOutputRef.current = session.outputTokens;
  }, [session.outputTokens]);

  useMetricsSync({
    date: today,
    totalInputTokens: session.tokens,
    totalOutputTokens: session.outputTokens,
    totalSpend: spend.usageToday,
    prsMerged: 0,
    maxContextPercent: session.percent,
  });

  const handleRewind = useCallback(async () => {
    await fetch('/api/rewind/confirm', { method: 'POST' });
  }, []);

  const handleCancel = useCallback(async () => {
    await fetch('/api/rewind/cancel', { method: 'POST' });
  }, []);

  const handleRetry = useCallback(async () => {
    await fetch('/api/rewind/confirm', { method: 'POST' });
  }, []);

  const handleDismiss = useCallback(async () => {
    await fetch('/api/rewind/cancel', { method: 'POST' });
  }, []);

  const rewindActive = rewind.status !== 'idle';

  return (
    <>
      <TopStrip
        session={session}
        spend={spend}
        rewindState={rewind}
        onRewind={handleRewind}
        onCancel={handleCancel}
      />
      <Room>
        <AlbusSprite state={aState} />
        <ThoughtBubble task={activity.task} />
      </Room>
      <ActivityStrip entries={activityLog.entries} albusState={aState} />
      {rewindActive && (
        <RewindPanel
          rewindState={rewind}
          onCancel={handleCancel}
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
