'use client';

interface StatCellProps {
  value: string;
  label: string;
}

function StatCell({ value, label }: StatCellProps) {
  return (
    <div
      style={{
        background: 'rgba(20, 14, 30, 0.6)',
        border: '1px solid #3a2e50',
        borderRadius: 3,
        padding: '6px 4px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 14, color: '#f0c860', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 7, color: '#8a78a0' }}>{label}</div>
    </div>
  );
}

interface StatGridProps {
  prsToday: number;
  costPerPr: number;
  rewindStreak: number;
  messagesThisSession: number;
}

export function StatGrid({ prsToday, costPerPr, rewindStreak, messagesThisSession }: StatGridProps) {
  const costPerPrStr = prsToday === 0 ? '—' : `$${costPerPr.toFixed(2)}`;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 4,
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <StatCell value={String(prsToday)} label="PRs" />
      <StatCell value={costPerPrStr} label="COST/PR" />
      <StatCell value={String(rewindStreak)} label="STREAK" />
      <StatCell value={String(messagesThisSession)} label="MSGS" />
    </div>
  );
}
