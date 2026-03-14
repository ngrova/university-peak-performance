'use client';

import { useEffect, useState } from 'react';
import type { AlbusStateSprite } from './sprite-state';

interface Props {
  app: string;
  task: string;
  lastCommitAt: string | null;
  albusState: AlbusStateSprite;
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function InfoStrip({ app, task, lastCommitAt, albusState }: Props) {
  // Tick every 30s so the "X min ago" stays fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const commitAge = timeAgo(lastCommitAt);
  const isCoding = albusState === 'coding';

  return (
    <div
      style={{
        width: 800,
        background: 'rgba(0,0,0,0.75)',
        borderTop: '2px solid #5c3d1e',
        borderLeft: '2px solid #5c3d1e',
        borderRight: '2px solid #5c3d1e',
        borderBottom: '2px solid #5c3d1e',
        borderRadius: '0 0 4px 4px',
        padding: '10px 14px',
        display: 'grid',
        gridTemplateColumns: '180px 1fr auto',
        alignItems: 'center',
        gap: 12,
        fontFamily: "'Press Start 2P', monospace",
        boxSizing: 'border-box',
      }}
    >
      {/* Left — title + app */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: 11, color: '#fbbf24', letterSpacing: '0.06em' }}>
          MISSION CONTROL
        </div>
        <div style={{ fontSize: 8, color: '#78716c', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {app}
        </div>
      </div>

      {/* Center — current task */}
      <div
        style={{
          fontSize: 9,
          color: '#e5e7eb',
          lineHeight: 1.7,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: '0.03em',
        }}
        title={task}
      >
        {task}
      </div>

      {/* Right — commit age + status badge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
        <div
          style={{
            fontSize: 8,
            color: '#a16207',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
          title={lastCommitAt ?? undefined}
        >
          {`⟳ ${commitAge}`}
        </div>
        <div
          style={{
            fontSize: 8,
            color: isCoding ? '#4ade80' : '#6b7280',
            letterSpacing: '0.05em',
            padding: '2px 6px',
            border: `1px solid ${isCoding ? '#166534' : '#374151'}`,
            borderRadius: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {isCoding ? '● CODING' : '○ IDLE'}
        </div>
      </div>
    </div>
  );
}
