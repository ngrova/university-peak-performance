'use client';

import { useCallback } from 'react';
import type { RewindStateFile } from '../api/rewind/rewind-state-file';

interface Props {
  status: RewindStateFile['status'];
  onRewind: () => void;
  onHardRewind: () => void;
}

export function RewindButton({ status, onRewind, onHardRewind }: Props) {
  const isIdle = status === 'idle';
  const isDone = status === 'done' || status === 'failed';

  const handleRewind = useCallback(() => { onRewind(); }, [onRewind]);
  const handleHardRewind = useCallback(() => { onHardRewind(); }, [onHardRewind]);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs uppercase tracking-widest text-[#E5E5E5]/40">Rewind</h2>
      <button
        onClick={handleRewind}
        disabled={!isIdle && !isDone}
        className="w-full py-4 font-mono text-lg tracking-widest uppercase rounded border border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {isIdle || isDone ? '⟲ Rewind' : 'Rewind in progress...'}
      </button>
      <button
        onClick={handleHardRewind}
        className="w-full py-2 font-mono text-sm tracking-widest uppercase rounded border border-[#666] text-[#888] hover:bg-white/5 transition-colors"
      >
        ⚡ Hard Rewind
      </button>
    </section>
  );
}
