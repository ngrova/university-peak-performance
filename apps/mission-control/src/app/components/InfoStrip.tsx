'use client';

import type { AlbusStateSprite } from './sprite-state';

function timeSince(isoString?: string): string {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

interface InfoStripProps {
  task: string;
  albusState: AlbusStateSprite;
  lastActivityAt?: string | undefined;
}

export function InfoStrip({ task, albusState, lastActivityAt }: InfoStripProps) {
  const isCoding = albusState === 'coding';
  const truncated = task.length > 60 ? task.slice(0, 57) + '...' : task;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        height: 36,
        background: 'rgba(10,6,16,0.88)',
        borderTop: '1px solid rgba(100,72,140,0.4)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        justifyContent: 'space-between',
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <span style={{ fontSize: 8, color: '#6a5880', minWidth: 56 }}>
        {timeSince(lastActivityAt)}
      </span>
      <span style={{ fontSize: 9, color: '#c0b0d0', flex: 1, textAlign: 'center', padding: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {truncated}
      </span>
      <div
        style={{
          fontSize: 8,
          padding: '3px 8px',
          borderRadius: 2,
          background: isCoding ? 'rgba(60,160,60,0.3)' : 'rgba(60,100,160,0.3)',
          color: isCoding ? '#60c860' : '#6090c0',
        }}
      >
        {isCoding ? 'CODING' : 'IDLE'}
      </div>
    </div>
  );
}
