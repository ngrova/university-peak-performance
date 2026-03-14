'use client';

import { useEffect, useState } from 'react';

interface Props {
  app: string;
  task: string;
  albusState: 'coding' | 'idle';
}

function timeAgo(ms: number): string {
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function CurrentTaskPanel({ app, task, albusState }: Props) {
  const [sinceMs, setSinceMs] = useState(0);
  useEffect(() => {
    setSinceMs(0);
    const id = setInterval(() => setSinceMs(s => s + 30_000), 30_000);
    return () => clearInterval(id);
  }, [task]);

  const isCoding = albusState === 'coding';

  return (
    <div style={{
      background: '#2a2238',
      border: '2px solid #3a2e50',
      borderRadius: 4,
      padding: '20px 24px',
      fontFamily: "'Press Start 2P', monospace",
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#8878a0', letterSpacing: '0.06em' }}>
          CURRENT TASK
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 8, color: '#8878a0' }}>{timeAgo(sinceMs)}</span>
          <span style={{
            fontSize: 8,
            color: isCoding ? '#60c860' : '#6090c0',
            padding: '3px 8px',
            border: `1px solid ${isCoding ? '#60c860' : '#6090c0'}`,
            borderRadius: 2,
          }}>
            {isCoding ? '● CODING' : '○ IDLE'}
          </span>
        </div>
      </div>

      {/* App label */}
      <div style={{ fontSize: 8, color: '#8878a0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {app}
      </div>

      {/* Task — the important bit */}
      <div style={{
        fontSize: 13,
        color: '#f0c860',
        lineHeight: 1.8,
        letterSpacing: '0.03em',
        wordBreak: 'break-word',
      }}>
        {task || 'Waiting for Nick...'}
      </div>
    </div>
  );
}
