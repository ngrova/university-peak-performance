'use client';

const STRIPE = `repeating-linear-gradient(
  45deg,
  rgba(64,176,160,0.6) 0px,
  rgba(64,176,160,0.6) 3px,
  rgba(40,130,120,0.3) 3px,
  rgba(40,130,120,0.3) 7px
)`;

interface ContextBarProps {
  tokens: number;
  cap: number;
  percent: number;
  rewindSavings: number;
  rewindSavingsPct: number;
}

export function ContextBar({ tokens, cap, percent, rewindSavings, rewindSavingsPct }: ContextBarProps) {
  const usedK = Math.round(tokens / 1000);
  const capK = Math.round(cap / 1000);
  const savingsK = Math.round(rewindSavings / 1000);

  // Base (system/workspace) = total - rewind savings
  const basePct = Math.max(0, percent - rewindSavingsPct);

  return (
    <div
      style={{
        position: 'fixed',
        top: 48,
        left: 0,
        right: 0,
        zIndex: 19,
        padding: '6px 16px 8px',
        background: 'rgba(10, 6, 16, 0.9)',
        borderBottom: '1px solid rgba(100, 72, 140, 0.4)',
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      {/* Track */}
      <div
        style={{
          position: 'relative',
          height: 12,
          background: 'rgba(20, 14, 30, 0.9)',
          border: '1px solid #3a2e50',
          borderRadius: 3,
          overflow: 'hidden',
          marginBottom: 5,
        }}
      >
        {/* Base fill — dark blue (system/workspace tokens, can't rewind away) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${basePct}%`,
            background: '#2a5a90',
            transition: 'width 0.8s ease',
          }}
        />
        {/* Rewind-recoverable fill — teal striped */}
        <div
          style={{
            position: 'absolute',
            left: `${basePct}%`,
            top: 0,
            bottom: 0,
            width: `${rewindSavingsPct}%`,
            background: STRIPE,
            transition: 'left 0.8s ease, width 0.8s ease',
          }}
        />
      </div>
      {/* Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 7, color: '#c0b0d0' }}>
          CONTEXT: {usedK}K / {capK}K ({percent}%)
        </span>
        {savingsK > 0 && (
          <span style={{ fontSize: 7, color: '#40b0a0' }}>
            rewind saves ~{savingsK}K ↩
          </span>
        )}
      </div>
    </div>
  );
}
