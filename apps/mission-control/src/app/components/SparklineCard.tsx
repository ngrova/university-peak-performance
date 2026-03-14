'use client';

const PANEL_STYLE: React.CSSProperties = {
  background: 'rgba(20, 14, 30, 0.6)',
  border: '1px solid #3a2e50',
  borderRadius: 3,
  padding: '8px 8px 6px',
  fontFamily: "'Press Start 2P', monospace",
};

interface SparklineCardProps {
  title: string;
  values: number[];
}

function barColor(val: number, avg: number): string {
  if (avg === 0) return '#8a68c0';
  const ratio = val / avg;
  if (ratio < 0.85) return '#50b050';
  if (ratio <= 1.15) return '#8a68c0';
  return '#c04848';
}

function trendText(values: number[]): { text: string; color: string } {
  if (values.length < 6) return { text: 'not enough data', color: '#8a78a0' };
  const first3 = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const last3 = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
  if (last3 < first3) return { text: 'trending down ↓', color: '#50b050' };
  return { text: 'trending up ↑', color: '#c04848' };
}

export function SparklineCard({ title, values }: SparklineCardProps) {
  const maxVal = Math.max(...values, 1);
  const avg = values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1);
  const trend = trendText(values);

  return (
    <div style={PANEL_STYLE}>
      <div style={{ fontSize: 7, color: '#8a78a0', letterSpacing: '0.06em', marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 24, marginBottom: 5 }}>
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: `${Math.round((v / maxVal) * 24)}px`,
              background: barColor(v, avg),
              minHeight: 1,
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 7, color: trend.color }}>{trend.text}</div>
    </div>
  );
}
