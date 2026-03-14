'use client';

import { contextBarColor, spendBarColor } from '../lib/grades';

interface StatusBarsProps {
  tokens: number;
  cap: number;
  percent: number;
  rewindSavings: number;
  rewindSavingsPct: number;
  usageToday: number;
  creditsTotal: number;
}

const DAILY_BUDGET = Number(process.env.NEXT_PUBLIC_DAILY_BUDGET ?? 100);

const WRAP = { background: '#2a2238', border: '2px solid #3a2e50', borderRadius: 4, padding: '10px 12px', fontFamily: "'Press Start 2P', monospace" };
const TRACK = { background: '#0d0a12', height: 14, borderRadius: 2, overflow: 'hidden' as const };
const LABEL_ROW = { display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#e8dcc8', marginBottom: 5 };

export function StatusBars({ tokens, cap, percent, rewindSavings, rewindSavingsPct, usageToday, creditsTotal }: StatusBarsProps) {
  const capK = Math.round(cap / 1000);
  const totalK = Math.round(tokens / 1000);
  const ctxPct = Math.min(100, Math.max(0, percent));
  const ctxColor = contextBarColor(ctxPct);

  const baselinePct = Math.max(0, Math.min(100, ctxPct - rewindSavingsPct));

  const spentPct = Math.min(100, (usageToday / DAILY_BUDGET) * 100);
  const spColor = spendBarColor(spentPct);

  const creditsRemaining = Math.max(0, creditsTotal);
  const creditsCap = Math.max(creditsTotal, 200);
  const creditsFillPct = Math.min(100, (creditsRemaining / creditsCap) * 100);
  const creditsColor = spendBarColor(100 - creditsFillPct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={WRAP}>
        <div style={LABEL_ROW}>
          <span>CONTEXT</span>
          <span style={{ color: '#8878a0' }}>{`${totalK}K / ${capK}K (${ctxPct}%)`}</span>
        </div>
        <div style={TRACK}>
          {baselinePct > 0 && <div style={{ width: `${baselinePct}%`, height: '100%', background: ctxColor, display: 'inline-block', transition: 'width 0.8s ease' }} />}
          {rewindSavingsPct > 0 && (
            <div style={{ width: `${rewindSavingsPct}%`, height: '100%', background: '#16a34a', opacity: 0.7, display: 'inline-block', transition: 'width 0.8s ease' }} />
          )}
        </div>
      </div>

      <div style={WRAP}>
        <div style={LABEL_ROW}>
          <span>DAILY SPEND</span>
          <span style={{ color: '#8878a0' }}>{`$${usageToday.toFixed(2)} / $${DAILY_BUDGET}`}</span>
        </div>
        <div style={TRACK}>
          <div style={{ width: `${spentPct}%`, height: '100%', background: spColor, transition: 'width 0.8s ease' }} />
        </div>
      </div>

      <div style={WRAP}>
        <div style={LABEL_ROW}>
          <span>CREDITS</span>
          <span style={{ color: '#8878a0' }}>{`$${creditsRemaining.toFixed(2)} left`}</span>
        </div>
        <div style={TRACK}>
          <div style={{ width: `${creditsFillPct}%`, height: '100%', background: creditsColor, transition: 'width 0.8s ease' }} />
        </div>
      </div>
    </div>
  );
}
