'use client';

import type { AlbusStateSprite } from './sprite-state';
import type { SubagentInfo } from '../api/subagents/route';

const MAX_SLOTS = 3;

interface AgentRosterProps {
  albusState: AlbusStateSprite;
  subagents: SubagentInfo[];
}

interface AgentRowProps {
  dotColor: string;
  label: string;
  dim?: boolean;
}

function AgentRow({ dotColor, label, dim }: AgentRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
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

export function AgentRoster({ albusState, subagents }: AgentRosterProps) {
  const albusDot = albusState === 'coding' ? '#50b050' : '#f0c860';
  const albusLabel = albusState === 'coding' ? 'Albus — coding' : 'Albus — idle';

  // Show up to MAX_SLOTS slots; fill from active subagents first, then stale, then empty
  const visible = subagents.slice(0, MAX_SLOTS);

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

      {Array.from({ length: MAX_SLOTS }).map((_, i) => {
        const agent = visible[i];
        if (!agent) {
          return (
            <AgentRow
              key={i}
              dotColor="#3a2e50"
              label={`Apprentice ${i + 1} — empty`}
              dim
            />
          );
        }
        const active = agent.active;
        return (
          <AgentRow
            key={agent.id}
            dotColor={active ? '#f0c860' : '#5a4870'}
            label={active ? `Apprentice ${i + 1} — active` : `Apprentice ${i + 1} — idle`}
            dim={!active}
          />
        );
      })}
    </div>
  );
}
