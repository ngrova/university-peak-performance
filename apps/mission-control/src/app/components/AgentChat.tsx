'use client';

import { StageLight } from './StageLight';
import type { RewindStateFile } from '../api/rewind/rewind-state-file';

interface Props {
  state: RewindStateFile;
  onConfirm: () => void;
  onCancel: () => void;
}

const STAGE_SEQUENCE = ['clear', 'restart', 'verify'] as const;
const STAGE_LABELS: Record<string, string> = { clear: 'Clear', restart: 'Restart', verify: 'Verify' };

function AwaitingAgent() {
  return (
    <div className="flex items-center gap-3 text-[#FACC15]">
      <span className="inline-block w-3 h-3 rounded-full bg-[#FACC15] animate-pulse" />
      <span className="text-sm font-mono">Waiting for Albus...</span>
    </div>
  );
}

function AgentMessage({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-[#1a1a1a] border border-[#333] p-4">
        <p className="text-sm text-[#E5E5E5] font-mono leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onConfirm} className="flex-1 py-2 text-sm font-mono rounded border border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80]/10 transition-colors">
          CONFIRM
        </button>
        <button onClick={onCancel} className="flex-1 py-2 text-sm font-mono rounded border border-[#666] text-[#888] hover:bg-white/5 transition-colors">
          CANCEL
        </button>
      </div>
    </div>
  );
}

function StageSequence({ stages }: { stages: RewindStateFile['stages'] }) {
  return (
    <div className="flex flex-col gap-3">
      {STAGE_SEQUENCE.map((s) => (
        <StageLight key={s} status={stages[s]} label={STAGE_LABELS[s] ?? s} />
      ))}
    </div>
  );
}

export function AgentChat({ state, onConfirm, onCancel }: Props) {
  if (state.status === 'idle') return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs uppercase tracking-widest text-[#E5E5E5]/40">Rewind Chat</h2>
      {state.status === 'awaiting-agent' && <AwaitingAgent />}
      {state.status === 'awaiting-confirm' && state.agentMessage && (
        <AgentMessage message={state.agentMessage} onConfirm={onConfirm} onCancel={onCancel} />
      )}
      {(state.status === 'running' || state.status === 'done' || state.status === 'failed') && (
        <StageSequence stages={state.stages} />
      )}
      {state.status === 'done' && (
        <p className="text-sm font-mono text-[#4ADE80]">✓ Session cleared. Fresh start.</p>
      )}
      {state.status === 'failed' && (
        <p className="text-sm font-mono text-[#F87171]">✗ Rewind failed. Check logs.</p>
      )}
    </section>
  );
}
