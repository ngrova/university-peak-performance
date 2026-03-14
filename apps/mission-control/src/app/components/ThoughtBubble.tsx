'use client';

interface Props {
  app: string;
  task: string;
  left: string;
  top: string;
}

export function ThoughtBubble({ app, task, left, top }: Props) {
  if (!app && !task) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Triangle pointer pointing UP toward Albus */}
      <div style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '9px solid #2d1a0e' }} />
      <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '7px solid rgba(255,252,240,0.96)', marginTop: -7 }} />

      {/* Bubble body */}
      <div
        style={{
          background: 'rgba(255,252,240,0.96)',
          border: '2px solid #2d1a0e',
          borderRadius: 4,
          padding: '8px 12px',
          maxWidth: 340,
          minWidth: 160,
          textAlign: 'left',
        }}
      >
        {/* App label — dim/secondary */}
        {app && (
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9,
              color: '#7c6450',
              marginBottom: 5,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            {app}
          </div>
        )}
        {/* Task — primary, larger */}
        {task && (
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 12,
              color: '#1a0a00',
              lineHeight: 1.6,
              wordBreak: 'break-word',
            }}
          >
            {task}
          </div>
        )}
      </div>
    </div>
  );
}
