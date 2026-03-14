'use client';

const ROBE_COLORS = ['#1a6a3a', '#6a1a1a', '#1a1a6a', '#6a5a1a', '#4a1a6a'];

interface Props {
  index: number;
  label?: string;
}

function ApprenticeSVG({ color }: { color: string }) {
  return (
    <svg width="24" height="38" viewBox="0 0 24 38" style={{ imageRendering: 'pixelated' }}>
      {/* hat */}
      <polygon points="12,1 7,12 17,12" fill="#111" />
      <rect x="6" y="11" width="12" height="3" rx="1" fill="#222" />
      {/* head */}
      <rect x="8" y="13" width="8" height="7" rx="1" fill="#f5d5a0" />
      {/* robe */}
      <polygon points="6,20 5,38 19,38 18,20" fill={color} />
      {/* eyes */}
      <rect x="9" y="15" width="2" height="2" fill="#333" />
      <rect x="13" y="15" width="2" height="2" fill="#333" />
    </svg>
  );
}

export function Apprentice({ index, label }: Props) {
  const color = ROBE_COLORS[index % ROBE_COLORS.length] ?? '#1a6a3a';
  return (
    <div className="apprentice-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <ApprenticeSVG color={color} />
      <div className="pixel-text" style={{ fontSize: 7, color: '#a87d55' }}>{label ?? `Apt ${index + 1}`}</div>
    </div>
  );
}
