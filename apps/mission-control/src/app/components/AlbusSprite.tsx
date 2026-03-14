'use client';

import Image from 'next/image';
import { albusSrc } from './sprite-state';
import type { AlbusStateSprite } from './sprite-state';

interface Props {
  state: AlbusStateSprite;
}

const CODING_POS = { left: '44%', top: '56%' };
const IDLE_POS   = { left: '46%', top: '58%' };

export function AlbusSprite({ state }: Props) {
  const src = albusSrc(state);
  const pos = state === 'coding' ? CODING_POS : IDLE_POS;

  return (
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
  );
}
