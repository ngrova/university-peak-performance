'use client';

interface Props {
  text: string;
  left: string;   // CSS left of the bubble CENTER
  top: string;    // CSS top of the bubble TOP (positioned below Albus)
}

export function ThoughtBubble({ text, left, top }: Props) {
  if (!text) return null;
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
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: '8px solid #2d1a0e',
        }}
      />
      {/* Inner triangle (white fill) */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderBottom: '6px solid rgba(255,255,255,0.92)',
          marginTop: -6,
        }}
      />
      {/* Bubble body */}
      <div
        style={{
          background: 'rgba(255,255,255,0.92)',
          border: '2px solid #2d1a0e',
          borderRadius: 4,
          padding: '7px 10px',
          maxWidth: 320,
          minWidth: 120,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 12,
            color: '#1a0a00',
            lineHeight: 1.6,
            display: 'block',
            wordBreak: 'break-word',
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}
