'use client';

function formatTimeSince(ms: number): string {
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hours}h ${rem}m ago` : `${hours}h ago`;
}

function timeColor(ms: number): string {
  const hours = ms / 3_600_000;
  if (hours < 2) return '#50b050';
  if (hours < 4) return '#d0a030';
  return '#c04848';
}

function healthText(contextPercent: number): string {
  if (contextPercent < 50) return 'session healthy';
  if (contextPercent < 75) return 'context growing';
  return 'rewind recommended';
}

interface LastRewindCardProps {
  timeSinceRewindMs: number;
  contextPercent: number;
}

export function LastRewindCard({ timeSinceRewindMs, contextPercent }: LastRewindCardProps) {
  return (
    <div
      style={{
        background: 'rgba(20, 14, 30, 0.6)',
        border: '1px solid #3a2e50',
        borderRadius: 3,
        padding: '6px 8px',
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <div style={{ fontSize: 7, color: '#8a78a0', marginBottom: 6 }}>LAST REWIND</div>
      <div style={{ fontSize: 13, color: timeColor(timeSinceRewindMs), marginBottom: 4 }}>
        {formatTimeSince(timeSinceRewindMs)}
      </div>
      <div style={{ fontSize: 7, color: '#8a78a0' }}>{healthText(contextPercent)}</div>
    </div>
  );
}
