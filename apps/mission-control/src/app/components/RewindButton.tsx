'use client';

import type { RewindStateFile, RewindStatus } from '../api/rewind/rewind-state-file';

interface Props {
  status: RewindStateFile['status'];
  onClick: () => void;
}

const IDLE_STATES: RewindStatus[] = ['idle', 'done', 'failed'];

const LABEL: Record<RewindStatus, string> = {
  'idle':             '⟳  CONTEXT REWIND',
  'awaiting-agent':   '⏳  AWAITING...',
  'awaiting-confirm': '⏳  AWAITING...',
  'running':          '✦  REWINDING...',
  'done':             '✓  COMPLETE',
  'failed':           '✗  FAILED — RETRY',
};

export function RewindButton({ status, onClick }: Props) {
  const isClickable = IDLE_STATES.includes(status);
  const isBusy      = status === 'running';
  const label       = LABEL[status] ?? LABEL['idle'];

  return (
    <>
      <button
        className={`rw-btn${isBusy ? ' busy' : ''} ${status !== 'idle' && status !== 'awaiting-agent' && status !== 'awaiting-confirm' ? status : ''}`}
        onClick={isClickable ? onClick : undefined}
        disabled={!isClickable}
        title={isClickable ? 'Compress conversation history to free up context' : label}
      >
        {isBusy && <span className="rw-spin" aria-hidden>⟳</span>}
        {label}
      </button>
    </>
  );
}
