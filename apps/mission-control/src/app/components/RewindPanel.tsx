'use client';

import { useEffect } from 'react';
import type { RewindStateFile, StageStatus } from '../api/rewind/rewind-state-file';

const PIXEL = "'Press Start 2P', monospace";

export interface RewindPanelProps {
  rewindState: RewindStateFile;
  onCancel: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}

const STAGES = [
  { key: 'memory'  as const, name: 'MEMORY',  activeWord: 'saving...',     doneWord: 'saved'   },
  { key: 'clear'   as const, name: 'CLEAR',   activeWord: 'wiping...',     doneWord: 'wiped'   },
  { key: 'restart' as const, name: 'RESTART', activeWord: 'restarting...', doneWord: 'healthy' },
  { key: 'verify'  as const, name: 'VERIFY',  activeWord: 'checking...',   doneWord: 'fresh'   },
];

type CardStatus = 'pending' | 'active' | 'done' | 'failed' | 'skipped';

function getCardStatus(
  stageKey: string,
  stageStatus: StageStatus,
  failedIndex: number,
  stageIndex: number,
): CardStatus {
  if (failedIndex !== -1 && stageIndex > failedIndex) return 'skipped';
  if (stageStatus === 'running') return 'active';
  if (stageStatus === 'done') return 'done';
  if (stageStatus === 'failed') return 'failed';
  return 'pending';
}

function getProgressWidth(status: CardStatus): string {
  if (status === 'active') return '70%';
  if (status === 'done') return '100%';
  if (status === 'failed') return '40%';
  return '0%';
}

function getProgressColor(status: CardStatus): string {
  if (status === 'active') return '#f0c860';
  if (status === 'done') return '#60c860';
  if (status === 'failed') return '#c04848';
  return '#3a2e50';
}

function getDotColor(status: CardStatus): string {
  if (status === 'active') return '#f0c860';
  if (status === 'done') return '#60c860';
  if (status === 'failed') return '#c04848';
  return '#3a2e50';
}

function getCardBorderColor(status: CardStatus): string {
  if (status === 'active') return 'rgba(240,200,96,0.5)';
  if (status === 'done') return 'rgba(96,200,96,0.3)';
  if (status === 'failed') return 'rgba(192,72,72,0.5)';
  return 'rgba(100,72,140,0.3)';
}

function getStatusWord(status: CardStatus, activeWord: string, doneWord: string): string {
  if (status === 'active') return activeWord;
  if (status === 'done') return doneWord;
  if (status === 'failed') return 'failed';
  if (status === 'skipped') return 'skipped';
  return 'waiting';
}

function getStatusWordColor(status: CardStatus): string {
  if (status === 'active') return '#f0c860';
  if (status === 'done') return '#60c860';
  if (status === 'failed') return '#c04848';
  if (status === 'skipped') return '#4a3e60';
  return '#4a3e60';
}

function getProgressMessage(stages: RewindStateFile['stages']): string {
  const { memory, clear, restart, verify } = stages;
  if (memory === 'running') return 'Sending memory flush to Albus... waiting for write confirmation';
  if (memory === 'done' && clear === 'idle') return 'Memory saved. Clearing session history...';
  if (clear === 'running') return 'Deleting sessions.json...';
  if (clear === 'done' && restart === 'idle') return 'Session cleared. Restarting gateway...';
  if (restart === 'running') return 'Bouncing gateway... polling health';
  if (restart === 'done' && verify === 'idle') return 'Gateway healthy. Verifying fresh session...';
  if (verify === 'running') return 'Checking token count on new session...';
  return 'All stages complete.';
}

function StageCard({
  name,
  activeWord,
  doneWord,
  status,
}: {
  name: string;
  activeWord: string;
  doneWord: string;
  status: CardStatus;
}) {
  const dotColor = getDotColor(status);
  const borderColor = getCardBorderColor(status);
  const statusWord = getStatusWord(status, activeWord, doneWord);
  const statusWordColor = getStatusWordColor(status);
  const progressWidth = getProgressWidth(status);
  const progressColor = getProgressColor(status);
  const opacity = status === 'pending' ? 0.5 : 1;

  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(20,14,30,0.7)',
        border: `1px solid ${borderColor}`,
        borderRadius: 3,
        padding: 4,
        textAlign: 'center',
        opacity,
        transition: 'opacity 0.3s, border-color 0.3s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <div
        className={status === 'active' ? 'rewind-dot-active' : undefined}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
        }}
      />
      <span style={{ fontSize: 7, color: '#a898b8', letterSpacing: '0.5px', fontFamily: PIXEL }}>
        {name}
      </span>
      <span style={{ fontSize: 6, fontWeight: 'bold', color: statusWordColor, fontFamily: PIXEL }}>
        {statusWord}
      </span>
      <div
        style={{
          height: 2,
          borderRadius: 1,
          marginTop: 2,
          width: '100%',
          background: 'rgba(20,14,30,0.9)',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 1,
            transition: 'width 0.3s',
            width: progressWidth,
            background: progressColor,
          }}
        />
      </div>
    </div>
  );
}

function StageCards({
  rewindState,
  allDone,
}: {
  rewindState: RewindStateFile;
  allDone?: boolean;
}) {
  const stages = rewindState.stages;
  const failedIndex = allDone
    ? -1
    : STAGES.findIndex((s) => stages[s.key] === 'failed');

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {STAGES.map((stage, i) => {
        const stageStatus = allDone ? 'done' : stages[stage.key];
        const status = allDone
          ? ('done' as CardStatus)
          : getCardStatus(stage.key, stageStatus, failedIndex, i);
        return (
          <StageCard
            key={stage.key}
            name={stage.name}
            activeWord={stage.activeWord}
            doneWord={stage.doneWord}
            status={status}
          />
        );
      })}
    </div>
  );
}

export function RewindPanel({ rewindState, onCancel, onRetry, onDismiss }: RewindPanelProps) {
  const { status } = rewindState;

  // Never render when idle
  if (status === 'idle') return null;

  // Auto-dismiss after 10s when done
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (status !== 'done') return;
    const id = setTimeout(onDismiss, 10_000);
    return () => clearTimeout(id);
  }, [status, onDismiss]);

  return (
    <>
      <style>{`
        @keyframes rewind-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .rewind-dot-active {
          animation: rewind-pulse 1s ease-in-out infinite;
        }
      `}</style>
      <div
        style={{
          background: 'rgba(10,6,16,0.95)',
          borderTop: '1px solid rgba(100,72,140,0.2)',
          padding: '4px 12px',
          flexShrink: 0,
          fontFamily: PIXEL,
        }}
      >
        {status === 'running' && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 9, color: '#d8b8ff', letterSpacing: '1px' }}>
                CONTEXT REWIND
              </span>
              <span
                onClick={onCancel}
                style={{ fontSize: 7, color: '#6a5880', textDecoration: 'underline', cursor: 'pointer' }}
              >
                cancel
              </span>
            </div>
            <StageCards rewindState={rewindState} />
            <div style={{ marginTop: 4, fontSize: 7, color: '#8a78a0' }}>
              {getProgressMessage(rewindState.stages)}
            </div>
          </>
        )}

        {status === 'done' && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 9, color: '#60c860' }}>REWIND COMPLETE ✓</span>
              <span
                onClick={onDismiss}
                style={{ fontSize: 7, color: '#60c860', textDecoration: 'underline', cursor: 'pointer' }}
              >
                dismiss
              </span>
            </div>
            <StageCards rewindState={rewindState} allDone />
            <div style={{ marginTop: 4, fontSize: 7, color: '#60c860' }}>
              Session reset. Albus is fresh. Context bar updated.
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 9, color: '#c04848' }}>REWIND FAILED ✕</span>
              <span
                onClick={onRetry}
                style={{ fontSize: 7, color: '#c04848', textDecoration: 'underline', cursor: 'pointer' }}
              >
                retry
              </span>
            </div>
            <StageCards rewindState={rewindState} />
            <div style={{ marginTop: 4, fontSize: 7, color: '#c04848' }}>
              Gateway health check timed out. Click retry to attempt again.
            </div>
          </>
        )}
      </div>
    </>
  );
}
