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
      <style>{`
        @keyframes rewindPulse {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.15); }
          50%       { box-shadow: 0 0 18px 6px rgba(251,191,36,0.85), inset 0 1px 0 rgba(255,255,255,0.15); }
        }
        @keyframes rewindSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .rw-btn {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          padding: 10px 22px;
          border-radius: 3px;
          border: 2px solid #92400e;
          outline: 2px solid #451a03;
          outline-offset: 2px;
          background: linear-gradient(180deg, #78350f 0%, #451a03 100%);
          color: #fbbf24;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
          box-shadow: 0 0 8px 2px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
          cursor: pointer;
          user-select: none;
          transition: filter 0.2s, background 0.2s, color 0.2s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: rewindPulse 2.5s ease-in-out infinite;
        }
        .rw-btn:hover:not(:disabled) {
          filter: brightness(1.2);
        }
        .rw-btn:active:not(:disabled) {
          filter: brightness(0.85);
          transform: translateX(-50%) translateY(1px);
        }
        .rw-btn:disabled,
        .rw-btn.busy {
          cursor: default;
          color: #a16207;
          border-color: #57534e;
          outline-color: #292524;
          background: linear-gradient(180deg, #292524 0%, #1c1917 100%);
          box-shadow: none;
          animation: none;
          filter: none;
        }
        .rw-btn.done {
          color: #4ade80;
          border-color: #166534;
          box-shadow: 0 0 10px 3px rgba(74,222,128,0.4);
          animation: none;
        }
        .rw-btn.failed {
          color: #f87171;
          border-color: #991b1b;
          box-shadow: 0 0 10px 3px rgba(248,113,113,0.4);
        }
        .rw-spin {
          display: inline-block;
          animation: rewindSpin 1s linear infinite;
        }
      `}</style>

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
