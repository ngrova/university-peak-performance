'use client';

import Image from 'next/image';
import { FloatingLabel } from './FloatingLabel';
import { albusSrc } from './sprite-state';
import type { AlbusStateSprite } from './sprite-state';

interface Props {
  state: AlbusStateSprite;
}

const CODING_POS = { left: '44%', top: '50%' };
const IDLE_POS   = { left: '52%', top: '16%' };

export function AlbusSprite({ state }: Props) {
  const src = albusSrc(state);
  const pos = state === 'coding' ? CODING_POS : IDLE_POS;
  const labelPos = state === 'coding'
    ? { left: '41%', top: '61%' }
    : { left: '48%', top: '28%' };
  const labelText = state === 'coding' ? 'CODING' : 'IDLE';

  return (
    <>
      <div style={{ position: 'absolute', left: pos.left, top: pos.top, width: '7%', transition: 'left 0.6s, top 0.6s' }}>
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
