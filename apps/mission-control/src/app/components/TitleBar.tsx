'use client';

export function TitleBar() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        padding: '0 16px',
        background: '#1a1520',
        borderBottom: '2px solid #3a2e50',
        fontFamily: "'Press Start 2P', monospace",
        flexShrink: 0,
      }}
    >
      <span style={{ color: '#f0c860', fontSize: 14, letterSpacing: '0.1em' }}>
        ALBUS&apos;S LOOKOUT
      </span>
      <span style={{ color: '#8878a0', fontSize: 9, letterSpacing: '0.05em' }}>
        Nick Grover HQ — Token Command
      </span>
    </div>
  );
}
