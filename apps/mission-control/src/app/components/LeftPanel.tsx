'use client';

import { GaugeCard } from './GaugeCard';
import { SparklineCard } from './SparklineCard';

const CREDIT_CAP = 200;
const DAILY_BUDGET = Number(process.env.NEXT_PUBLIC_DAILY_BUDGET ?? 100);

interface SessionData {
  tokens: number;
  cap: number;
  percent: number;
  outputTokens: number;
  messageCount: number;
}

interface SpendData {
  usage: number;
  usageToday: number;
}

interface LeftPanelProps {
  session: SessionData;
  spend: SpendData;
  tokenTrend: number[];
}

function ctxBarColor(pct: number): string {
  if (pct <= 25) return '#4090d0';
  if (pct <= 50) return '#40b0a0';
  if (pct <= 75) return '#d0a030';
  return '#c04848';
}

function creditsBarColor(remaining: number): string {
  if (remaining > 50) return '#50b050';
  if (remaining > 20) return '#d0a030';
  return '#c04848';
}

function spendBarColor(pct: number): string {
  if (pct <= 50) return '#50b050';
  if (pct <= 80) return '#d0a030';
  return '#c04848';
}

export function LeftPanel({ session, spend, tokenTrend }: LeftPanelProps) {
  const usedK = Math.round(session.tokens / 1000);
  const capK = Math.round(session.cap / 1000);
  const ctxPct = Math.min(100, Math.max(0, session.percent));

  const creditsRemaining = Math.max(0, CREDIT_CAP - spend.usage);
  const creditsPct = Math.min(100, (creditsRemaining / CREDIT_CAP) * 100);
  const creditsColor = creditsBarColor(creditsRemaining);
  const creditsValueColor = creditsRemaining < 20 ? '#c04848' : '#f0c860';

  const spentPct = Math.min(100, (spend.usageToday / DAILY_BUDGET) * 100);
  const spendColor = spendBarColor(spentPct);
  const spendValueColor = spentPct > 80 ? '#c04848' : spentPct > 50 ? '#d0a030' : '#50b050';

  return (
    <div
      style={{
        position: 'fixed',
        left: 8,
        top: 56,
        bottom: 120,
        width: 160,
        zIndex: 20,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: 'rgba(16, 10, 24, 0.82)',
        border: '1px solid rgba(100, 72, 140, 0.5)',
        borderRadius: 4,
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <GaugeCard
        title="CONTEXT WINDOW"
        fillPct={ctxPct}
        fillColor={ctxBarColor(ctxPct)}
        leftLabel={`${ctxPct}%`}
        rightLabel={`${usedK}K / ${capK}K`}
      />
      <GaugeCard
        title="CREDITS LEFT"
        fillPct={creditsPct}
        fillColor={creditsColor}
        leftLabel={<span style={{ color: creditsValueColor }}>${creditsRemaining.toFixed(0)}</span>}
        rightLabel={`of $${CREDIT_CAP}`}
      />
      <GaugeCard
        title="DAILY SPEND"
        fillPct={spentPct}
        fillColor={spendColor}
        leftLabel={<span style={{ color: spendValueColor }}>${spend.usageToday.toFixed(2)}</span>}
        rightLabel={`/ $${DAILY_BUDGET} cap`}
      />
      <SparklineCard title="7-DAY TOKENS" values={tokenTrend} />
    </div>
  );
}
