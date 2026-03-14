'use client';

import { gradeColor } from '../lib/grades';

interface Props {
  efficiencyGrade: string;
  prsToday: number;
  costPerPr: number;
  costPerPrGrade: string;
  rewindStreak: number;
}

const CARD = {
  background: '#2a2238',
  border: '2px solid #3a2e50',
  borderRadius: 4,
  padding: '12px 8px',
  flex: 1,
  textAlign: 'center' as const,
  fontFamily: "'Press Start 2P', monospace",
};

interface StatCardProps { label: string; value: string; grade?: string }

function StatCard({ label, value, grade }: StatCardProps) {
  const color = grade ? gradeColor(grade) : '#f0c860';
  return (
    <div style={CARD}>
      <div style={{ fontSize: 22, color, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 7, color: '#8878a0', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

export function SessionScorecard({ efficiencyGrade, prsToday, costPerPr, costPerPrGrade, rewindStreak }: Props) {
  const costStr = costPerPr > 0 ? `$${costPerPr.toFixed(2)}` : 'N/A';
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '8px 0',
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <StatCard label="EFFICIENCY" value={efficiencyGrade} grade={efficiencyGrade} />
      <StatCard label="PRs TODAY" value={String(prsToday)} />
      <StatCard label="COST/PR" value={costStr} grade={costPerPrGrade} />
      <StatCard label="REWIND STREAK" value={`${rewindStreak}×`} />
    </div>
  );
}
