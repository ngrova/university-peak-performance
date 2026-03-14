'use client';

interface StatusBarsProps {
  tokens: number;
  cap: number;
  percent: number;
  systemTokens: number;
  convoTokens: number;
  rewindSavings: number;
  rewindSavingsPct: number;
  usage: number;
  usageToday: number;
}

const DAILY_CAP = 100;
const CREDIT_CAP = 200;

function usedTodayColor(usedPct: number): string {
  if (usedPct >= 75) return '#ef4444';
  if (usedPct >= 40) return '#facc15';
  return '#4ade80';
}

function creditsRemainingColor(remainingPct: number): string {
  if (remainingPct <= 20) return '#ef4444';
  if (remainingPct <= 50) return '#facc15';
  return '#4ade80';
}

export function StatusBars({ tokens, cap, percent, systemTokens, convoTokens, rewindSavings, rewindSavingsPct, usage, usageToday }: StatusBarsProps) {
  const capK = Math.round(cap / 1000);
  const totalK = Math.round(tokens / 1000);
  const ctxPct = Math.min(100, Math.max(0, percent));

  // Segment percentages relative to cap
  const baselineTokens = Math.max(0, tokens - rewindSavings - convoTokens);
  const baselinePct = Math.min(100, Math.round((baselineTokens / cap) * 100));
  const convoPct = Math.min(100 - baselinePct - rewindSavingsPct, Math.round((convoTokens / cap) * 100));
  // sysPct kept for reference but bar now uses baseline/savings/convo layout
  const sysPct = Math.min(100, Math.round((systemTokens / cap) * 100)); void sysPct;

  const todayPct = Math.min(100, Math.max(0, (usageToday / DAILY_CAP) * 100));
  const todayColor = usedTodayColor(todayPct);

  const remaining = Math.max(0, CREDIT_CAP - usage);
  const remainingPct = (remaining / CREDIT_CAP) * 100;
  const creditsFillPct = Math.min(100, Math.max(0, remainingPct));
  const creditsColor = creditsRemainingColor(remainingPct);

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        background: 'rgba(0,0,0,0.6)',
        border: '2px solid #5c3d1e',
        borderRadius: 2,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: "'Press Start 2P', monospace",
        zIndex: 10,
      }}
    >
      {/* Context bar — segmented: system (blue-gray) + convo (green→amber→red) */}
      <div>
        <div style={{ fontSize: 12, color: '#e5e7eb', marginBottom: 4, letterSpacing: '0.05em' }}>
          {`CONTEXT: ${totalK}K / ${capK}K (${ctxPct}%)`}
        </div>
        {/* Bar: baseline | savings (green striped) | this msg | empty */}
        <style>{`
          @keyframes savingsStripe {
            0%   { background-position: 0 0; }
            100% { background-position: 28px 0; }
          }
        `}</style>
        <div style={{ background: '#1a1a1a', height: 14, borderRadius: 2, overflow: 'hidden', display: 'flex', position: 'relative' }}>
          {/* Baseline — stays after rewind */}
          {baselinePct > 0 && (
            <div
              title={`Baseline (stays after rewind): ~${Math.round((tokens - rewindSavings) / 1000)}K`}
              style={{ width: `${baselinePct}%`, height: '100%', background: '#4b5563', transition: 'width 0.8s ease', flexShrink: 0 }}
            />
          )}
          {/* Rewind savings — animated green stripes */}
          {rewindSavingsPct > 0 && (
            <div
              title={`Rewind frees ${Math.round(rewindSavings / 1000)}K tokens (${rewindSavingsPct}%)`}
              style={{
                width: `${rewindSavingsPct}%`,
                height: '100%',
                backgroundImage: 'repeating-linear-gradient(90deg, #16a34a 0px, #16a34a 14px, #22c55e 14px, #22c55e 28px)',
                backgroundSize: '28px 100%',
                animation: 'savingsStripe 1.2s linear infinite',
                transition: 'width 0.8s ease',
                flexShrink: 0,
              }}
            />
          )}
          {/* This message — small blue sliver */}
          {convoPct > 0 && (
            <div
              title={`This message: ${convoTokens} tokens`}
              style={{ width: `${convoPct}%`, height: '100%', background: '#38bdf8', transition: 'width 0.8s ease', flexShrink: 0, minWidth: 3 }}
            />
          )}
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
          <div style={{ display: 'flex', gap: 10, fontSize: 8, color: '#9ca3af' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#4b5563', borderRadius: 1 }} />
              {`BASE ${Math.round((tokens - rewindSavings) / 1000)}K`}
            </span>
            {rewindSavingsPct > 5 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#4ade80' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: '#22c55e', borderRadius: 1 }} />
                {`⟳ SAVES ${Math.round(rewindSavings / 1000)}K`}
              </span>
            )}
          </div>
          <span style={{ fontSize: 8, color: '#6b7280' }}>{`${ctxPct}% USED`}</span>
        </div>
      </div>

      {/* Credits used today — fills left→right, green→red, bad when full */}
      <div>
        <div style={{ fontSize: 12, color: '#e5e7eb', marginBottom: 4, letterSpacing: '0.05em' }}>
          {`USED TODAY: $${usageToday.toFixed(2)} / $${DAILY_CAP}`}
        </div>
        <div style={{ background: '#1a1a1a', height: 14, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${todayPct}%`, height: '100%', background: todayColor, transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* Credits remaining — fills right→left, green→red, bad when low */}
      <div>
        <div style={{ fontSize: 12, color: '#e5e7eb', marginBottom: 4, letterSpacing: '0.05em' }}>
          {`CREDITS: $${remaining.toFixed(2)} LEFT`}
        </div>
        <div style={{ background: '#1a1a1a', height: 14, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${creditsFillPct}%`, height: '100%', background: creditsColor, transition: 'width 0.8s ease' }} />
        </div>
      </div>
    </div>
  );
}
