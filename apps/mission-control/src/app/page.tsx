'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Room } from './components/Room';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { RewindBar } from './components/RewindBar';
import { InfoStrip } from './components/InfoStrip';
import { AlbusSprite } from './components/AlbusSprite';
import { ApprenticeSprites } from './components/ApprenticeSprites';
import { ThoughtBubble } from './components/ThoughtBubble';
import { RewindFlash } from './components/RewindFlash';
import { SpellbookOverlay } from './components/SpellbookOverlay';
import { albusState } from './components/sprite-state';
import { calcEfficiency, efficiencyGrade } from './lib/grades';
import { useMetricsSync } from './hooks/useMetricsSync';
import type { RewindStateFile } from './api/rewind/rewind-state-file';

const IDLE_REWIND: RewindStateFile = {
  status: 'idle', agentMessage: null, requestedAt: null, confirmedAt: null,
  stages: { memory: 'idle', clear: 'idle', restart: 'idle', verify: 'idle' },
};

function usePoll<T>(url: string, interval: number, init: T) {
  const [data, setData] = useState<T>(init);
  useEffect(() => {
    const go = () => fetch(url).then(r => r.json()).then(setData).catch(() => {});
    go(); const id = setInterval(go, interval); return () => clearInterval(id);
  }, [url, interval]);
  return data;
}

interface SessionData {
  tokens: number; cap: number; percent: number;
  outputTokens: number; messageCount: number;
  systemTokens: number; convoTokens: number;
  rewindSavings: number; rewindSavingsPct: number;
}
interface SpendData { usage: number; usageToday: number; }
interface PrsData { prsToday: number; }
interface MetricsDay { date: string; totalInputTokens: number; totalSpend: number; prsMerged: number; rewindStreak: number; }
interface MetricsData { days: MetricsDay[] }
interface ActivityData { app: string; task: string; lastCommitAt?: string; }

export default function LookoutPage() {
  const session = usePoll<SessionData>('/api/session', 30_000, {
    tokens: 0, cap: 200_000, percent: 0, outputTokens: 0, messageCount: 0,
    systemTokens: 0, convoTokens: 0, rewindSavings: 0, rewindSavingsPct: 0,
  });
  const spend = usePoll<SpendData>('/api/spend', 60_000, { usage: 0, usageToday: 0 });
  const prs = usePoll<PrsData>('/api/github/prs', 300_000, { prsToday: 0 });
  const metrics = usePoll<MetricsData>('/api/metrics', 600_000, { days: [] });
  const activity = usePoll<ActivityData>('/api/activity', 15_000, { app: 'Mission Control', task: '' });
  const subagents = usePoll<{ count: number }>('/api/subagents', 10_000, { count: 0 });
  const rewind = usePoll<RewindStateFile>('/api/rewind/state', 5_000, IDLE_REWIND);

  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = metrics.days.find(d => d.date === today);
  const last7 = [...metrics.days].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const tokenTrend = last7.map(d => Math.round(d.totalInputTokens / 1000));
  while (tokenTrend.length < 7) tokenTrend.unshift(0);

  const effPct = calcEfficiency(session.outputTokens, session.tokens);
  const effGrade = efficiencyGrade(effPct);
  const costPerPr = prs.prsToday > 0 ? spend.usageToday / prs.prsToday : 0;

  const lastRewindAt = useRef<number>(Date.now());
  useEffect(() => { if (rewind.status === 'done') lastRewindAt.current = Date.now(); }, [rewind.status]);
  const timeSinceRewindMs = Date.now() - lastRewindAt.current;

  const prevOutputRef = useRef(0);
  const aState = albusState(prevOutputRef.current, session.outputTokens);
  useEffect(() => { prevOutputRef.current = session.outputTokens; }, [session.outputTokens]);

  useMetricsSync({
    date: today,
    totalInputTokens: session.tokens,
    totalOutputTokens: session.outputTokens,
    totalSpend: spend.usageToday,
    prsMerged: prs.prsToday,
    maxContextPercent: session.percent,
  });

  const [showOverlay, setShowOverlay] = useState(false);
  const handleRewind = useCallback(async () => {
    await fetch('/api/rewind/request', { method: 'POST' });
    setShowOverlay(true);
  }, []);
  const handleConfirm = useCallback(async () => { await fetch('/api/rewind/confirm', { method: 'POST' }); }, []);
  const handleCancel = useCallback(async () => {
    await fetch('/api/rewind/cancel', { method: 'POST' });
    setShowOverlay(false);
  }, []);

  useEffect(() => {
    if (rewind.status === 'done') {
      const id = setTimeout(async () => {
        await fetch('/api/rewind/cancel', { method: 'POST' });
        window.location.reload();
      }, 2_000);
      return () => clearTimeout(id);
    }
  }, [rewind.status]);

  return (
    <>
      <Room>
        <AlbusSprite state={aState} />
        <ApprenticeSprites count={subagents.count} />
        <ThoughtBubble task={activity.task} />
        <RewindFlash status={rewind.status} />
      </Room>

      <TopBar />
      <LeftPanel session={session} spend={spend} tokenTrend={tokenTrend} />
      <RightPanel
        effGrade={effGrade}
        effPct={effPct}
        prsToday={prs.prsToday}
        costPerPr={costPerPr}
        rewindStreak={todayEntry?.rewindStreak ?? 0}
        messagesThisSession={session.messageCount}
        subagentCount={subagents.count}
        albusState={aState}
        timeSinceRewindMs={timeSinceRewindMs}
        contextPercent={session.percent}
      />
      <RewindBar rewindState={rewind} onRewind={handleRewind} />
      <InfoStrip task={activity.task} albusState={aState} lastActivityAt={activity.lastCommitAt} />

      {showOverlay && (
        <SpellbookOverlay
          state={rewind}
          onClose={() => setShowOverlay(false)}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
