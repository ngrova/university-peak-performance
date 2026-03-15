'use client';

import type { LogEntry } from '../api/activity-log/route';
import type { AlbusStateSprite } from './sprite-state';

const PIXEL = "'Press Start 2P', monospace";

const DOT_COLOR: Record<string, string> = {
  merge: '#60c860',
  push: '#60c860',
  work: '#f0c860',
  test: '#40b0d0',
  read: '#8a68c0',
  spawn: '#d08040',
};

function dotColor(type: LogEntry['type']): string {
  return DOT_COLOR[type] ?? '#5a4870';
}

interface ActivityStripProps {
  entries: LogEntry[];
  albusState: AlbusStateSprite;
}

function EntryCell({ entry }: { entry: LogEntry }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      <span
        style={{
          fontSize: 8,
          color: '#5a4870',
          width: 28,
          textAlign: 'right',
          flexShrink: 0,
          fontFamily: PIXEL,
        }}
      >
        {entry.ago}
      </span>
      <span
        style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: dotColor(entry.type),
          margin: '0 6px',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 9,
          color: '#c0b0d0',
          fontFamily: PIXEL,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {entry.action}
      </span>
    </div>
  );
}

export function ActivityStrip({ entries, albusState }: ActivityStripProps) {
  const recent = entries.slice(0, 6);
  const isCoding = albusState === 'coding';

  return (
    <div
      style={{
        background: 'rgba(10,6,16,0.95)',
        borderTop: '1px solid rgba(100,72,140,0.3)',
        padding: '8px 16px',
        fontFamily: PIXEL,
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 9, color: '#8a78a0', letterSpacing: '1px' }}>ACTIVITY LOG</span>
        <span
          style={{
            fontSize: 8,
            fontWeight: 'bold',
            padding: '3px 8px',
            borderRadius: 2,
            background: isCoding ? 'rgba(60,160,60,0.25)' : 'rgba(60,100,160,0.25)',
            color: isCoding ? '#60c860' : '#6090c0',
          }}
        >
          {isCoding ? 'CODING' : 'IDLE'}
        </span>
      </div>

      {/* 2-column grid */}
      {recent.length === 0 ? (
        <div style={{ fontSize: 7, color: '#3a2e50', textAlign: 'center' }}>no activity yet</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3px 24px',
          }}
        >
          {recent.map((entry) => (
            <EntryCell key={entry.id + entry.timestamp} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
