'use client';

import Image from 'next/image';
import { FloatingLabel } from './FloatingLabel';
import { ThoughtBubble } from './ThoughtBubble';
import { albusSrc } from './sprite-state';
import type { AlbusStateSprite } from './sprite-state';

interface Props {
  state: AlbusStateSprite;
  thought?: string;
}

const CODING_POS = { left: '44%', top: '50%' };
const IDLE_POS   = { left: '52%', top: '62%' };

// Bubble positions — centered above sprite
const CODING_BUBBLE = { left: '47%', top: '42%' };
const IDLE_BUBBLE   = { left: '55%', top: '54%' };

export function AlbusSprite({ state, thought }: Props) {
  const src = albusSrc(state);
  const pos = state === 'coding' ? CODING_POS : IDLE_POS;
  const bubblePos = state === 'coding' ? CODING_BUBBLE : IDLE_BUBBLE;
  const labelPos = state === 'coding'
    ? { left: '41%', top: '61%' }
    : { left: '48%', top: '74%' };
  const labelText = state === 'coding' ? 'CODING' : 'IDLE';

  return (
    <>
      {thought && (
        <ThoughtBubble text={thought} left={bubblePos.left} top={bubblePos.top} />
      )}
      <div style={{ position: 'absolute', left: pos.left, top: pos.top, width: '4%', transition: 'left 0.6s, top 0.6s' }}>
        <Image
          src={src}
          alt={`Albus ${state}`}
          width={72}
          height={72}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block', mixBlendMode: 'multiply' }}
          unoptimized
        />
      </div>
      <FloatingLabel text={labelText} left={labelPos.left} top={labelPos.top} />
    </>
  );
}
