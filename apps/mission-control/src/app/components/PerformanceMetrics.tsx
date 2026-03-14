'use client';

import { gradeColor } from '../lib/grades';
import { Sparkline } from './Sparkline';

interface Props {
  efficiencyPct: number;
  efficiencyGrade: string;
  tokensPerTask: number;
  tokensPerTaskGrade: string;
  timeSinceRewindMs: number;
  messagesThisSession: number;
  subagentCount: number;
  tokenTrend7d: number[];
  spendTrend7d: number[];
}

const ROW = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #3a2e50' };
const LABEL = { fontSize: 8, color: '#8878a0', fontFamily: "'Press Start 2P', monospace" };
const VALUE = { fontSize: 9, fontFamily: "'Press Start 2P', monospace", color: '#e8dcc8' };

function formatRewindTime(ms: number): { text: string; color: string } {
  const h = ms / 3_600_000;
  if (h < 2) return { text: `${Math.round(ms / 60_000)}m ago`, color: '#60c860' };
  if (h < 4) return { text: `${h.toFixed(1)}h ago`, color: '#c0a830' };
  return { text: `${h.toFixed(1)}h ago`, color: '#c04040' };
}

function GradeBadge({ grade }: { grade: string }) {
  return <span style={{ color: gradeColor(grade), marginLeft: 6, fontSize: 9 }}>{grade}</span>;
}

export function PerformanceMetrics({ efficiencyPct, efficiencyGrade, tokensPerTask, tokensPerTaskGrade, timeSinceRewindMs, messagesThisSession, subagentCount, tokenTrend7d, spendTrend7d }: Props) {
  const rewindTime = formatRewindTime(timeSinceRewindMs);
  return (
    <div style={{ background: '#2a2238', border: '2px solid #3a2e50', borderRadius: 4, padding: '8px 12px' }}>
      <div style={ROW}>
        <span style={LABEL}>SESSION EFFICIENCY</span>
        <span style={VALUE}>{efficiencyPct.toFixed(1)}%<GradeBadge grade={efficiencyGrade} /></span>
      </div>
      <div style={ROW}>
        <span style={LABEL}>TOKENS/TASK</span>
        <span style={VALUE}>{tokensPerTask}K<GradeBadge grade={tokensPerTaskGrade} /></span>
      </div>
      <div style={ROW}>
        <span style={LABEL}>SINCE LAST REWIND</span>
        <span style={{ ...VALUE, color: rewindTime.color }}>{rewindTime.text}</span>
      </div>
      <div style={ROW}>
        <span style={LABEL}>MESSAGES</span>
        <span style={VALUE}>{messagesThisSession}</span>
      </div>
      <div style={ROW}>
        <span style={LABEL}>SUB-AGENTS</span>
        <span style={VALUE}>{subagentCount} apprentice{subagentCount !== 1 ? 's' : ''}</span>
      </div>
      <div style={ROW}>
        <span style={LABEL}>7D TOKEN TREND</span>
        <Sparkline values={tokenTrend7d} />
      </div>
      <div style={{ ...ROW, borderBottom: 'none' }}>
        <span style={LABEL}>7D SPEND TREND</span>
        <Sparkline values={spendTrend7d} />
      </div>
    </div>
  );
}
