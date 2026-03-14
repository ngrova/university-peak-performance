'use client';

import { useReducer, useCallback } from 'react';
import { StageLight } from './StageLight';
import { rewindReducer, INITIAL_STATE } from './rewind-state';
import type { StageName } from './rewind-state';

const STAGE_LABELS: Record<StageName, string> = {
  memory: 'Memory',
  clear: 'Clear',
  restart: 'Restart',
  verify: 'Verify',
};

async function callStage(stage: StageName): Promise<void> {
  const res = await fetch(`/api/rewind/${stage}`, { method: 'POST' });
  if (!res.ok) {
    const body = await res.json() as { error?: string };
    throw new Error(body.error ?? `${stage} failed`);
  }
}

export function RewindButton() {
  const [state, dispatch] = useReducer(rewindReducer, INITIAL_STATE);

  const runSequence = useCallback(async () => {
    dispatch({ type: 'START' });
  }, []);

  const confirmMemory = useCallback(async () => {
    dispatch({ type: 'STAGE_RUNNING', stage: 'memory' });
    try {
      await callStage('memory');
      dispatch({ type: 'STAGE_DONE', stage: 'memory' });
      for (const stage of ['clear', 'restart', 'verify'] as StageName[]) {
        dispatch({ type: 'STAGE_RUNNING', stage });
        try {
          await callStage(stage);
          dispatch({ type: 'STAGE_DONE', stage });
        } catch (err) {
          dispatch({ type: 'STAGE_FAILED', stage, error: err instanceof Error ? err.message : 'Failed' });
          return;
        }
      }
      dispatch({ type: 'RESET' });
    } catch (err) {
      dispatch({ type: 'STAGE_FAILED', stage: 'memory', error: err instanceof Error ? err.message : 'Failed' });
    }
  }, []);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xs uppercase tracking-widest text-[#E5E5E5]/40">Rewind</h2>
      <div className="flex flex-col gap-3">
        {(Object.keys(STAGE_LABELS) as StageName[]).map((stage) => (
          <StageLight key={stage} status={state.stages[stage]} label={STAGE_LABELS[stage]} />
        ))}
      </div>
      {state.memoryPrompt && (
        <div className="rounded border border-[#FACC15]/40 bg-[#FACC15]/5 p-4">
          <p className="text-sm text-[#FACC15] mb-3">Update MEMORY.md now, then click Confirm.</p>
          <button
            onClick={() => void confirmMemory()}
            className="px-4 py-2 text-sm font-mono bg-[#FACC15] text-[#0D0D0D] rounded hover:bg-[#FACC15]/80 transition-colors"
          >
            Confirm
          </button>
        </div>
      )}
      {state.error && (
        <p className="text-sm text-[#F87171] font-mono">{state.error}</p>
      )}
      <button
        onClick={() => void runSequence()}
        disabled={state.running}
        className="w-full py-4 font-mono text-lg tracking-widest uppercase rounded border border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ⟲ Rewind
      </button>
    </section>
  );
}
