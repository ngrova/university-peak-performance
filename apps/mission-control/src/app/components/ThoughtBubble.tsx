'use client';

interface Props {
  task: string;
}

export function ThoughtBubble({ task }: Props) {
  const text = task || 'Waiting for Nick...';

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '22%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Bubble body */}
      <div
        style={{
          background: 'rgba(16,10,24,0.88)',
          border: '1px solid rgba(100,72,140,0.5)',
          borderRadius: 8,
          padding: '8px 12px',
          maxWidth: 200,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9,
          color: '#c0b0d0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {text}
      </div>

      {/* Triangle pointer pointing DOWN toward Albus */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid rgba(100,72,140,0.5)',
        }}
      />
    </div>
  );
}
