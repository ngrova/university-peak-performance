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
}

const BUDGET_CAP = 200;

function spendBarColor(remainingPct: number): string {
  if (remainingPct <= 20) return '#ef4444';
  if (remainingPct <= 50) return '#facc15';
  return '#4ade80';
}

export function StatusBars({ tokens, cap, percent, systemTokens, convoTokens, rewindSavings, rewindSavingsPct, usage }: StatusBarsProps) {
  const capK = Math.round(cap / 1000);
  const totalK = Math.round(tokens / 1000);
  const ctxPct = Math.min(100, Math.max(0, percent));

  // Segment percentages relative to cap
  const sysPct  = Math.min(100, Math.round((systemTokens / cap) * 100));
  const convoPct = Math.min(100 - sysPct, Math.round((convoTokens / cap) * 100));

  const remaining = Math.max(0, BUDGET_CAP - usage);
  const remainingPct = (remaining / BUDGET_CAP) * 100;
  const spendFillPct = Math.min(100, Math.max(0, remainingPct));
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
        <div style={{ background: '#1a1a1a', height: 14, borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
          {/* System prompt segment */}
          {sysPct > 0 && (
            <div
              title={`System: ~${Math.round(systemTokens / 1000)}K tokens`}
              style={{
                width: `${sysPct}%`,
                height: '100%',
                background: '#4b5563',
                transition: 'width 0.8s ease',
                borderRight: convoTokens > 0 ? '1px solid #1a1a1a' : 'none',
              }}
            />
          )}
          {/* Conversation segment */}
          {convoPct > 0 && (
            <div
              title={`Your conversation: ~${Math.round(convoTokens / 1000)}K tokens`}
              style={{
                width: `${convoPct}%`,
                height: '100%',
                background: ctxPct >= 80 ? '#ef4444' : ctxPct >= 50 ? '#f59e0b' : '#38bdf8',
                transition: 'width 0.8s ease',
              }}
            />
          )}
        </div>
        {/* Legend + rewind savings */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
          <div style={{ display: 'flex', gap: 10, fontSize: 8, color: '#9ca3af' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#4b5563', borderRadius: 1 }} />
              {`CACHED ${Math.round(systemTokens / 1000)}K`}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#38bdf8', borderRadius: 1 }} />
              {`THIS MSG ${convoTokens}`}
            </span>
          </div>
          {rewindSavingsPct > 5 && (
            <span style={{ fontSize: 8, color: '#4ade80', whiteSpace: 'nowrap' }}>
              {`⟳ REWIND SAVES ${Math.round(rewindSavings / 1000)}K (${rewindSavingsPct}%)`}
            </span>
          )}
        </div>
      </div>

      {/* Spend bar */}
      <div>
        <div style={{ fontSize: 12, color: '#e5e7eb', marginBottom: 4, letterSpacing: '0.05em' }}>
          {`CREDITS: $${usage.toFixed(2)}`}
        </div>
        <div style={{ background: '#1a1a1a', height: 14, borderRadius: 2, overflow: 'hidden' }}>
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
