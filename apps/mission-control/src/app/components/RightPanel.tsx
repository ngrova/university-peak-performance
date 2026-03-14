'use client';

import { StatGrid } from './StatGrid';
import { AgentRoster } from './AgentRoster';
import { LastRewindCard } from './LastRewindCard';
import type { AlbusStateSprite } from './sprite-state';
import type { SubagentInfo } from '../api/subagents/route';

interface RightPanelProps {
  effGrade: string;
  effPct: number;
  prsToday: number;
  costPerPr: number;
  rewindStreak: number;
  messagesThisSession: number;
  subagents: SubagentInfo[];
  albusState: AlbusStateSprite;
  timeSinceRewindMs: number;
  contextPercent: number;
}

export function RightPanel({
  effGrade, effPct, prsToday, costPerPr,
  rewindStreak, messagesThisSession, subagents,
  albusState, timeSinceRewindMs, contextPercent,
}: RightPanelProps) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 8,
        top: 56,
        bottom: 120,
        width: 160,
        zIndex: 20,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: 'rgba(16, 10, 24, 0.82)',
        border: '1px solid rgba(100, 72, 140, 0.5)',
        borderRadius: 4,
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      {/* Session Score */}
      <div
        style={{
          background: 'rgba(20, 14, 30, 0.6)',
          border: '1px solid #3a2e50',
          borderRadius: 3,
          padding: '6px 8px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 7, color: '#8a78a0', marginBottom: 6 }}>SESSION SCORE</div>
        <div style={{ fontSize: 22, color: '#f0c860', marginBottom: 4 }}>{effGrade}</div>
        <div style={{ fontSize: 8, color: '#c0b0d0' }}>efficiency {effPct.toFixed(1)}%</div>
      </div>

      <StatGrid
        prsToday={prsToday}
        costPerPr={costPerPr}
        rewindStreak={rewindStreak}
        messagesThisSession={messagesThisSession}
      />

      <AgentRoster albusState={albusState} subagents={subagents} />

      <LastRewindCard
        timeSinceRewindMs={timeSinceRewindMs}
        contextPercent={contextPercent}
      />
    </div>
  );
}
