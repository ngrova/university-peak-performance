'use client';

interface Props {
  app: string;
  task: string;
  lastCommitAt?: string;
}

export function InfoStrip({ app, task, lastCommitAt }: Props) {
  return (
    <div
      style={{
        background: '#2a2238',
        border: '2px solid #3a2e50',
        borderRadius: 4,
        padding: '8px 12px',
        fontFamily: "'Press Start 2P', monospace",
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#f0c860', letterSpacing: '0.08em' }}>
          ALBUS&apos;S LOOKOUT
        </span>
        <span style={{ fontSize: 7, color: '#8878a0' }}>{app}</span>
      </div>
      <div style={{ fontSize: 7, color: '#e8dcc8', opacity: 0.8, lineHeight: 1.6 }}>
        {task}
      </div>
      {lastCommitAt && (
        <div style={{ fontSize: 6, color: '#8878a0' }}>
          Last commit: {lastCommitAt}
        </div>
      )}
    </div>
  );
}
