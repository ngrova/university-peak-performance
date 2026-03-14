'use client';

interface Props {
  text: string;
  left: string;   // CSS left of the bubble CENTER
  top: string;    // CSS top of the bubble TOP
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
      }}
    >
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
            fontSize: 6,
            color: '#1a0a00',
            lineHeight: 1.6,
            display: 'block',
            wordBreak: 'break-word',
          }}
        >
          {text}
        </span>
      </div>
      {/* Triangle pointer pointing down toward Albus */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid #2d1a0e',
          margin: '0 auto',
          position: 'relative',
        }}
      />
      {/* Inner triangle (white fill) */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '6px solid rgba(255,255,255,0.92)',
          margin: '-8px auto 0',
          position: 'relative',
        }}
      />
    </div>
  );
}
