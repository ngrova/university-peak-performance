'use client';

import { useState } from 'react';
import type { RewindStateFile } from '../api/rewind/rewind-state-file';

const RUNE_DEFS: Array<{ key: keyof RewindStateFile['stages']; label: string }> = [
  { key: 'memory', label: 'MEM' },
  { key: 'clear',  label: 'CLR' },
  { key: 'restart', label: 'RST' },
  { key: 'verify', label: 'VER' },
];

type RuneState = 'off' | 'active' | 'complete' | 'failed';

function runeState(stageStatus: string): RuneState {
  if (stageStatus === 'idle') return 'off';
  if (stageStatus === 'running' || stageStatus === 'in-progress') return 'active';
  if (stageStatus === 'done') return 'complete';
  if (stageStatus === 'failed') return 'failed';
  return 'off';
}

const RUNE_STYLES: Record<RuneState, React.CSSProperties> = {
  off:      { background: 'rgba(40,24,60,0.8)', borderColor: '#6a48a0' },
  active:   { background: '#f0c860', borderColor: '#ffe880', boxShadow: '0 0 6px #f0c860' },
  complete: { background: '#60c860', borderColor: '#80e880' },
  failed:   { background: '#c04848', borderColor: '#e06060' },
};

interface RuneDotProps {
  state: RuneState;
  label: string;
}

function RuneDot({ state, label }: RuneDotProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div
        style={{
          width: 10, height: 10, borderRadius: '50%',
          border: '1px solid',
          ...RUNE_STYLES[state],
        }}
      />
      <span style={{ fontSize: 7, color: '#5a4870', fontFamily: "'Press Start 2P', monospace" }}>
        {label}
      </span>
    </div>
  );
}

interface RewindBarProps {
  rewindState: RewindStateFile;
  onRewind: () => void;
}

export function RewindBar({ rewindState, onRewind }: RewindBarProps) {
  const [hovered, setHovered] = useState(false);

  const btnText =
    rewindState.status === 'idle' ? 'CONTEXT REWIND'
    : rewindState.status === 'done' ? 'COMPLETE'
    : 'CASTING...';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 40,
        left: 0,
        right: 0,
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: '0 16px',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        {RUNE_DEFS.map(({ key, label }) => (
          <RuneDot key={key} state={runeState(rewindState.stages[key])} label={label} />
        ))}
      </div>

      <button
        onClick={onRewind}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'rgba(80,40,120,0.85)',
          border: `2px solid ${hovered ? '#c088ff' : '#a068e0'}`,
          borderRadius: 6,
          padding: '10px 32px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 11,
          color: '#e0c0ff',
          letterSpacing: 2,
          cursor: 'pointer',
          boxShadow: hovered
            ? '0 0 20px rgba(160,104,224,0.6)'
            : '0 0 12px rgba(160,104,224,0.4)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {btnText}
      </button>
    </div>
  );
}
