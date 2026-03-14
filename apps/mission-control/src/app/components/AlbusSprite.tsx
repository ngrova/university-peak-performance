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

// Albus stands front-center of the platform
const CODING_POS = { left: '44%', top: '56%' };
const IDLE_POS   = { left: '46%', top: '58%' };

const CODING_BUBBLE = { left: '50%', top: '46%' };
const IDLE_BUBBLE   = { left: '52%', top: '48%' };

export function AlbusSprite({ state, thought }: Props) {
  const src = albusSrc(state);
  const pos = state === 'coding' ? CODING_POS : IDLE_POS;
  const bubblePos = state === 'coding' ? CODING_BUBBLE : IDLE_BUBBLE;
  const labelPos = state === 'coding'
    ? { left: '45%', top: '68%' }
    : { left: '47%', top: '70%' };
  const labelText = state === 'coding' ? 'CODING' : 'IDLE';

  return (
    <>
      {thought && (
        <ThoughtBubble text={thought} left={bubblePos.left} top={bubblePos.top} />
      )}
      <div style={{ position: 'absolute', left: pos.left, top: pos.top, width: '10%', transition: 'left 0.6s, top 0.6s' }}>
        <Image
          src={src}
          alt={`Albus ${state}`}
          width={72}
          height={72}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
          unoptimized
        />
      </div>
      <FloatingLabel text={labelText} left={labelPos.left} top={labelPos.top} />
    </>
  );
}
