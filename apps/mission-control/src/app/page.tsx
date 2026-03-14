'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Room } from './components/Room';
import { TitleBar } from './components/TitleBar';
import { StatusBars } from './components/StatusBars';
import { SessionScorecard } from './components/SessionScorecard';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { CurrentTaskPanel } from './components/CurrentTaskPanel';
import { albusState } from './components/sprite-state';
import { SpellbookOverlay } from './components/SpellbookOverlay';
import { SpellbookSprite } from './components/SpellbookSprite';
import { RewindFlash } from './components/RewindFlash';
import {
  calcEfficiency, efficiencyGrade, tokensPerTaskGrade, costPerPrGrade,
} from './lib/grades';
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

interface SessionData { tokens: number; cap: number; percent: number; systemTokens: number; convoTokens: number; rewindSavings: number; rewindSavingsPct: number; outputTokens: number; messageCount: number; }
interface SpendData { usage: number; usageToday: number; }
interface PrsData { prsToday: number; }
interface MetricsDay { date: string; totalInputTokens: number; totalSpend: number; prsMerged: number; rewindStreak: number; rewinds: number; }
interface MetricsData { days: MetricsDay[] }
interface ActivityData { app: string; task: string; }

export default function LookoutPage() {
  const session = usePoll<SessionData>('/api/session', 30_000, { tokens: 0, cap: 200_000, percent: 0, systemTokens: 0, convoTokens: 0, rewindSavings: 0, rewindSavingsPct: 0, outputTokens: 0, messageCount: 0 });
  const spend = usePoll<SpendData>('/api/spend', 60_000, { usage: 0, usageToday: 0 });
  const prs = usePoll<PrsData>('/api/github/prs', 300_000, { prsToday: 0 });
  const metrics = usePoll<MetricsData>('/api/metrics', 600_000, { days: [] });
  const activity = usePoll<ActivityData>('/api/activity', 15_000, { app: 'Mission Control', task: 'Waiting for Nick...' });
  const subagents = usePoll<{ count: number }>('/api/subagents', 10_000, { count: 0 });
  const rewind = usePoll<RewindStateFile>('/api/rewind/state', 5_000, IDLE_REWIND);

  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = metrics.days.find(d => d.date === today);
  const last7 = [...metrics.days].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const tokenTrend = last7.map(d => Math.round(d.totalInputTokens / 1000));
  const spendTrend = last7.map(d => d.totalSpend);
  while (tokenTrend.length < 7) tokenTrend.unshift(0);
  while (spendTrend.length < 7) spendTrend.unshift(0);

  const effPct = calcEfficiency(session.outputTokens, session.tokens);
  const effGrade = efficiencyGrade(effPct);
  const costPerPr = prs.prsToday > 0 ? spend.usageToday / prs.prsToday : 0;
  const cpGrade = costPerPrGrade(costPerPr);
  const tokPerTask = prs.prsToday > 0 ? Math.round(session.tokens / 1000 / prs.prsToday) : 0;
  const tptGrade = tokensPerTaskGrade(tokPerTask);

  const lastRewindAt = useRef<number>(Date.now());
  useEffect(() => { if (rewind.status === 'done') lastRewindAt.current = Date.now(); }, [rewind.status]);
  const timeSinceRewindMs = Date.now() - lastRewindAt.current;

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
  const handleCancel = useCallback(async () => { await fetch('/api/rewind/cancel', { method: 'POST' }); setShowOverlay(false); }, []);

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
    <main style={{ background: '#1a1520', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 800 }}>
        <TitleBar />
        <div style={{ position: 'relative', width: 800 }}>
          <Room
            tokens={session.tokens}
            subagentCount={subagents.count}
          />
          <RewindFlash status={rewind.status} />
          <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 10 }}>
            <SpellbookSprite status={rewind.status} onClick={handleRewind} />
          </div>
        </div>
        <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <StatusBars
            tokens={session.tokens} cap={session.cap} percent={session.percent}
            rewindSavings={session.rewindSavings} rewindSavingsPct={session.rewindSavingsPct}
            usageToday={spend.usageToday} creditsTotal={spend.usage}
          />
          <SessionScorecard
            efficiencyGrade={effGrade} prsToday={prs.prsToday}
            costPerPr={costPerPr} costPerPrGrade={cpGrade}
            rewindStreak={todayEntry?.rewindStreak ?? 0}
          />
          <PerformanceMetrics
            efficiencyPct={effPct} efficiencyGrade={effGrade}
            tokensPerTask={tokPerTask} tokensPerTaskGrade={tptGrade}
            timeSinceRewindMs={timeSinceRewindMs}
            messagesThisSession={session.messageCount}
            subagentCount={subagents.count}
            tokenTrend7d={tokenTrend} spendTrend7d={spendTrend}
          />
          <CurrentTaskPanel
            app={activity.app}
            task={activity.task}
            albusState={albusState(0, session.outputTokens)}
          />
        </div>
      </div>
      {showOverlay && (
        <SpellbookOverlay state={rewind} onClose={() => setShowOverlay(false)} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </main>
  );
}
