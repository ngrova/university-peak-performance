'use client';

export function TopBar() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        background: 'linear-gradient(to bottom, rgba(10,6,16,0.85) 0%, transparent 100%)',
        height: 48,
        padding: '0 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <span style={{ fontSize: 12, color: '#f0c860', letterSpacing: 3 }}>
        ALBUS&apos;S LOOKOUT
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        <span style={{ fontSize: 9, color: '#8a78a0' }}>Nick Grover HQ</span>
        <span style={{ fontSize: 8, color: '#5a4870' }}>Token Command</span>
      </div>
    </div>
  );
}
