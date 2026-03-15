'use client';

import type { LogEntry } from '../api/activity-log/route';
import type { AlbusStateSprite } from './sprite-state';

const PIXEL = "'Press Start 2P', monospace";

const DOT_COLOR: Record<string, string> = {
  merge: '#60c860',
  push:  '#60c860',
  work:  '#f0c860',
  test:  '#40b0d0',
  read:  '#8a68c0',
  spawn: '#d08040',
};

const DOT_LABEL: Record<string, string> = {
  merge: 'merge',
  push:  'push',
  work:  'coding',
  test:  'test',
  read:  'reading',
  spawn: 'agent',
};

function dotColor(type: LogEntry['type']): string {
  return DOT_COLOR[type] ?? '#5a4870';
}

interface ActivityStripProps {
  entries: LogEntry[];
  albusState: AlbusStateSprite;
}

function EntryRow({ entry }: { entry: LogEntry }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 14,
          color: '#5a4870',
          width: 36,
          textAlign: 'right',
          flexShrink: 0,
          fontFamily: PIXEL,
          whiteSpace: 'nowrap',
        }}
      >
        {entry.ago}
      </span>
      <span
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: dotColor(entry.type),
          margin: '0 10px',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 14,
          color: '#c0b0d0',
          fontFamily: PIXEL,
          whiteSpace: 'nowrap',
        }}
      >
        {entry.action}
      </span>
    </div>
  );
}

export function ActivityStrip({ entries, albusState: _albusState }: ActivityStripProps) {
  const recent = entries.slice(0, 10);

  // Unique types present in recent entries — for legend
  const legendTypes = Array.from(new Set(recent.map((e) => e.type))).slice(0, 5);

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
      {/* Header row: label left, color legend right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 13, color: '#8a78a0', letterSpacing: '1px' }}>ACTIVITY LOG</span>

        {/* Color legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {legendTypes.map((type) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: DOT_COLOR[type] ?? '#5a4870',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 8, color: '#5a4870', fontFamily: PIXEL }}>
                {DOT_LABEL[type] ?? type}
              </span>
            </div>
          ))}
          {/* Always show at least a static mini legend if no entries yet */}
          {legendTypes.length === 0 && (
            <>
              {[['merge','#60c860'],['coding','#f0c860'],['test','#40b0d0'],['reading','#8a68c0'],['agent','#d08040']] .map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 8, color: '#5a4870', fontFamily: PIXEL }}>{label}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Single scrolling row of entries */}
      {recent.length === 0 ? (
        <div style={{ fontSize: 10, color: '#3a2e50' }}>no activity yet</div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {recent.map((entry) => (
            <EntryRow key={entry.id + entry.timestamp} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
