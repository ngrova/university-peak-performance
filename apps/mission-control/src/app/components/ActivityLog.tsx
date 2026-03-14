'use client';

import type { LogEntry } from '../api/activity-log/route';

interface ActivityLogProps {
  entries: LogEntry[];
}

const TYPE_COLOR: Record<LogEntry['type'], string> = {
  merge:  '#50b050',  // green
  push:   '#50b050',  // green
  work:   '#f0c860',  // gold
  test:   '#f0c860',  // gold
  read:   '#6090c0',  // blue
  spawn:  '#c080e0',  // purple
};

const TYPE_PREFIX: Record<LogEntry['type'], string> = {
  merge:  '⬆',
  push:   '→',
  work:   '✎',
  test:   '✓',
  read:   '◎',
  spawn:  '✦',
};

function EntryRow({ entry }: { entry: LogEntry }) {
  const color = TYPE_COLOR[entry.type];
  const prefix = TYPE_PREFIX[entry.type];

  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        paddingBottom: 7,
        borderBottom: '1px solid rgba(58, 46, 80, 0.4)',
        marginBottom: 7,
      }}
    >
      <div style={{ flexShrink: 0, minWidth: 34 }}>
        <span style={{ fontSize: 7, color: '#5a4870' }}>{entry.ago}</span>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 8, color, flexShrink: 0 }}>{prefix}</span>
        <span style={{ fontSize: 7, color, lineHeight: 1.5 }}>{entry.action}</span>
      </div>
    </div>
  );
}

export function ActivityLog({ entries }: ActivityLogProps) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 8,
        top: 98,   // below TopBar (48) + ContextBar (~50)
        bottom: 120,
        width: 180,
        zIndex: 20,
        background: 'rgba(16, 10, 24, 0.88)',
        border: '1px solid rgba(100, 72, 140, 0.5)',
        borderRadius: 4,
        fontFamily: "'Press Start 2P', monospace",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 10px 6px',
          borderBottom: '1px solid rgba(58, 46, 80, 0.6)',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 7, color: '#8a78a0', letterSpacing: '0.08em' }}>ACTIVITY LOG</div>
        <div style={{ fontSize: 6, color: '#3a2e50', marginTop: 3 }}>────────────────</div>
      </div>

      {/* Scrollable entries */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 10px',
          scrollbarWidth: 'none',
        }}
      >
        {entries.length === 0 ? (
          <div style={{ fontSize: 7, color: '#3a2e50', textAlign: 'center', marginTop: 16 }}>
            no activity yet
          </div>
        ) : (
          entries.map((entry) => <EntryRow key={entry.id + entry.timestamp} entry={entry} />)
        )}
      </div>
    </div>
  );
}
