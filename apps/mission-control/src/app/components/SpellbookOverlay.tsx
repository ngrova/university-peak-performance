'use client';

import type { RewindStateFile } from '../api/rewind/rewind-state-file';
import { AgentChat } from './AgentChat';

const RUNE_SYMBOLS = ['✦', '☽', '⚡', '★'] as const;
const RUNE_STAGES = ['memory', 'clear', 'restart', 'verify'] as const;
const RUNE_LABELS = ['Memory', 'Clear', 'Restart', 'Verify'] as const;

type StageName = 'memory' | 'clear' | 'restart' | 'verify';

function runeClass(status: string): string {
  if (status === 'done') return 'rune-done';
  if (status === 'running') return 'rune-active';
  return 'rune-idle';
}

function Rune({ symbol, label, status, angle }: { symbol: string; label: string; status: string; angle: number }) {
  const r = 80;
  const rad = (angle - 90) * (Math.PI / 180);
  const x = 120 + r * Math.cos(rad);
  const y = 130 + r * Math.sin(rad);
  return (
    <div className={runeClass(status)} style={{ position: 'absolute', left: x - 24, top: y - 24, textAlign: 'center', width: 48 }}>
      <div style={{ fontSize: 28, lineHeight: 1 }}>{symbol}</div>
      <div className="pixel-text" style={{ fontSize: 9, color: '#e5e5e5', marginTop: 2 }}>{label}</div>
    </div>
  );
}

interface Props {
  state: RewindStateFile;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SpellbookOverlay({ state, onClose, onConfirm, onCancel }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,5,30,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 240, height: 260, marginBottom: 16 }}>
        {RUNE_STAGES.map((stage, i) => (
          <Rune
            key={stage}
            symbol={RUNE_SYMBOLS[i] ?? '✦'}
            label={RUNE_LABELS[i] ?? stage}
            status={state.stages[stage as StageName]}
            angle={i * 90}
          />
        ))}
        {/* center star */}
        <div style={{ position: 'absolute', left: 108, top: 118, fontSize: 24, opacity: 0.4 }}>✧</div>
      </div>

      <div style={{ width: 320, maxWidth: '90vw' }}>
        <AgentChat state={state} onConfirm={onConfirm} onCancel={onCancel} />
      </div>

      {state.status === 'idle' && (
        <button
          onClick={onClose}
          className="pixel-text"
          style={{ marginTop: 16, padding: '8px 24px', background: '#2a1a5a', border: '2px solid #6a4aaa', color: '#c8b8f8', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}
        >
          CLOSE
        </button>
      )}
    </div>
  );
}
