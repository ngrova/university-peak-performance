'use client';

import Image from 'next/image';
import { FloatingLabel } from './FloatingLabel';
import { ThoughtBubble } from './ThoughtBubble';
import { albusSrc } from './sprite-state';
import type { AlbusStateSprite } from './sprite-state';

interface Props {
  state: AlbusStateSprite;
  app?: string;
  task?: string;
}

// Albus stands center of the treetop platform
const CODING_POS = { left: '44%', top: '52%' };
const IDLE_POS   = { left: '44%', top: '52%' };

// Thought bubble slightly to the right of Albus
const CODING_BUBBLE = { left: '52%', top: '38%' };
const IDLE_BUBBLE   = { left: '52%', top: '38%' };

export function AlbusSprite({ state, app, task }: Props) {
  const src = albusSrc(state);
  const pos = state === 'coding' ? CODING_POS : IDLE_POS;
  const bubblePos = state === 'coding' ? CODING_BUBBLE : IDLE_BUBBLE;
  const labelPos = state === 'coding'
    ? { left: '45%', top: '68%' }
    : { left: '47%', top: '70%' };
  const labelText = state === 'coding' ? 'CODING' : 'IDLE';

  return (
    <>
      {(app || task) && (
        <ThoughtBubble app={app ?? ''} task={task ?? ''} left={bubblePos.left} top={bubblePos.top} />
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
