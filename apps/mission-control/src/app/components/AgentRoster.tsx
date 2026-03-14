'use client';

import type { AlbusStateSprite } from './sprite-state';

const MAX_APPRENTICES = 2;

interface AgentRosterProps {
  albusState: AlbusStateSprite;
  subagentCount: number;
}

interface AgentRowProps {
  dotColor: string;
  label: string;
  dim?: boolean;
}

function AgentRow({ dotColor, label, dim }: AgentRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 8, color: dim ? '#5a4870' : '#c0b0d0' }}>{label}</span>
    </div>
  );
}

export function AgentRoster({ albusState, subagentCount }: AgentRosterProps) {
  const albusDot = albusState === 'coding' ? '#50b050' : '#f0c860';
  const albusLabel = albusState === 'coding' ? 'Albus — coding' : 'Albus — idle';
  const activeCount = Math.min(subagentCount, MAX_APPRENTICES);

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
      <div style={{ fontSize: 7, color: '#8a78a0', marginBottom: 6 }}>AGENTS</div>
      <AgentRow dotColor={albusDot} label={albusLabel} />
      {Array.from({ length: MAX_APPRENTICES }).map((_, i) => {
        const active = i < activeCount;
        return (
          <AgentRow
            key={i}
            dotColor={active ? '#f0c860' : '#3a2e50'}
            label={active ? `Apprentice ${i + 1} — active` : `Apprentice ${i + 1} — empty`}
            dim={!active}
          />
        );
      })}
    </div>
  );
}
