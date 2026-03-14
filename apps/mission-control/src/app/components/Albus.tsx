'use client';

export type AlbusState = 'idle' | 'active' | 'waiting';

interface Props {
  state: AlbusState;
}

function WizardSVG({ state }: { state: AlbusState }) {
  const bodyAnim = state === 'idle' ? 'bob 1s ease-in-out infinite' :
                   state === 'active' ? 'bob 0.5s ease-in-out infinite' : 'none';
  const armAnim = state === 'active' ? 'quill 0.4s ease-in-out infinite' :
                  state === 'waiting' ? 'wave 1s ease-in-out infinite' : 'none';

  return (
    <svg width="36" height="56" viewBox="0 0 36 56" style={{ imageRendering: 'pixelated', animation: bodyAnim }}>
      {/* hat */}
      <polygon points="18,2 10,18 26,18" fill="#1a0a5a" />
      <rect x="8" y="17" width="20" height="4" rx="1" fill="#2a1a8a" />
      {/* head */}
      <rect x="12" y="20" width="12" height="10" rx="2" fill="#f5d5a0" />
      {/* beard */}
      <rect x="13" y="28" width="10" height="6" rx="1" fill="#e8e8e8" />
      {/* robe body */}
      <polygon points="10,34 8,56 28,56 26,34" fill="#2a1a8a" />
      <rect x="12" y="33" width="12" height="2" fill="#3a2aaa" />
      {/* stars on robe */}
      <circle cx="15" cy="42" r="1.5" fill="#fbbf24" />
      <circle cx="21" cy="46" r="1" fill="#fbbf24" />
      {/* arm / quill side */}
      <rect x="6" y="35" width="6" height="3" rx="1" fill="#2a1a8a" style={{ transformOrigin: '9px 37px', animation: armAnim }} />
      {state === 'active' && (
        <line x1="6" y1="37" x2="2" y2="44" stroke="#f5d5a0" strokeWidth="1.5" style={{ transformOrigin: '6px 37px', animation: armAnim }} />
      )}
      {/* eyes */}
      <rect x="14" y="23" width="2" height="2" fill="#333" />
      <rect x="20" y="23" width="2" height="2" fill="#333" />
    </svg>
  );
}

export function Albus({ state }: Props) {
  return (
    <div
      title={`Albus: ${state}`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
    >
      <WizardSVG state={state} />
      <div className="pixel-text" style={{ fontSize: 7, color: '#a87d55' }}>Albus</div>
    </div>
  );
}
