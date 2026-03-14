import React from 'react';

interface Props {
  text: string;
  left: string;
  top: string;
  style?: React.CSSProperties;
}

const BASE_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-press-start-2p), 'Press Start 2P', monospace",
  fontSize: 8,
  color: 'white',
  textShadow: '1px 1px 2px black',
  position: 'absolute',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
};

export function FloatingLabel({ text, left, top, style }: Props) {
  return (
    <div style={{ ...BASE_STYLE, left, top, ...style }}>
      {text}
    </div>
  );
}
