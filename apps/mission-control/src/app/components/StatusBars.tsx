'use client';

interface StatusBarsProps {
  tokens: number;   // raw token count
  cap: number;      // token cap (e.g. 200000)
  percent: number;  // 0-100
  usage: number;    // credits spent (e.g. 12.47)
}

const BUDGET_CAP = 50;

function contextBarColor(pct: number): string {
  if (pct >= 80) return '#ef4444';
  if (pct >= 50) return '#f59e0b';
  return '#38bdf8';
}

function spendBarColor(remainingPct: number): string {
  if (remainingPct <= 20) return '#ef4444';
  if (remainingPct <= 50) return '#facc15';
  return '#4ade80';
}

export function StatusBars({ tokens, cap, percent, usage }: StatusBarsProps) {
  const tokensK = Math.round(tokens / 1000);
  const capK = Math.round(cap / 1000);
  const ctxPct = Math.min(100, Math.max(0, percent));

  const remaining = Math.max(0, BUDGET_CAP - usage);
  const remainingPct = (remaining / BUDGET_CAP) * 100;
  const spendFillPct = Math.min(100, Math.max(0, remainingPct));

  const ctxColor = contextBarColor(ctxPct);
  const spendColor = spendBarColor(remainingPct);

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
        gap: 6,
        fontFamily: "'Press Start 2P', monospace",
        zIndex: 10,
      }}
    >
      {/* Context bar */}
      <div>
        <div style={{ fontSize: 12, color: '#e5e7eb', marginBottom: 3, letterSpacing: '0.05em' }}>
          {`CONTEXT: ${tokensK}K / ${capK}K (${ctxPct}%)`}
        </div>
        <div
          style={{
            background: '#1a1a1a',
            height: 10,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${ctxPct}%`,
              height: '100%',
              background: ctxColor,
              transition: 'width 0.8s ease',
            }}
          />
        </div>
      </div>

      {/* Spend bar */}
      <div>
        <div style={{ fontSize: 12, color: '#e5e7eb', marginBottom: 3, letterSpacing: '0.05em' }}>
          {`CREDITS: $${usage.toFixed(2)}`}
        </div>
        <div
          style={{
            background: '#1a1a1a',
            height: 10,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${spendFillPct}%`,
              height: '100%',
              background: spendColor,
              transition: 'width 0.8s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
