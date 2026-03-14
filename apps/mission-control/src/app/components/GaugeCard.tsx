'use client';

const PANEL_STYLE: React.CSSProperties = {
  background: 'rgba(20, 14, 30, 0.6)',
  border: '1px solid #3a2e50',
  borderRadius: 3,
  padding: '8px 8px 6px',
  fontFamily: "'Press Start 2P', monospace",
};

const TRACK_STYLE: React.CSSProperties = {
  background: 'rgba(20, 14, 30, 0.9)',
  border: '1px solid #3a2e50',
  height: 10,
  borderRadius: 2,
  overflow: 'hidden',
  marginBottom: 5,
};

interface GaugeCardProps {
  title: string;
  fillPct: number;
  fillColor: string;
  leftLabel: React.ReactNode;
  rightLabel: React.ReactNode;
}

export function GaugeCard({ title, fillPct, fillColor, leftLabel, rightLabel }: GaugeCardProps) {
  const pct = Math.min(100, Math.max(0, fillPct));
  return (
    <div style={PANEL_STYLE}>
      <div style={{ fontSize: 7, color: '#8a78a0', letterSpacing: '0.06em', marginBottom: 6 }}>
        {title}
      </div>
      <div style={TRACK_STYLE}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: fillColor,
            transition: 'width 0.8s ease',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 11, color: '#f0c860' }}>{leftLabel}</span>
        <span style={{ fontSize: 7, color: '#c0b0d0' }}>{rightLabel}</span>
      </div>
    </div>
  );
}
