'use client';

import Image from 'next/image';
import { FloatingLabel } from './FloatingLabel';
import { moneyBagSrc } from './sprite-state';
import type { MoneyBagState } from './sprite-state';

interface Props {
  state: MoneyBagState;
  credits: number;
}

const STATE_LABELS: Record<MoneyBagState, string> = {
  full:  'FLUSH',
  half:  'OK',
  empty: 'LOW',
};

// MoneyBag sits on the right side of the platform
export function MoneyBagSprite({ state, credits }: Props) {
  const src = moneyBagSrc(state);
  const label = `$${credits.toFixed(2)} ${STATE_LABELS[state]}`;

  return (
    <>
      <div style={{ position: 'absolute', left: '64%', top: '54%', width: '11%' }}>
        <Image
          src={src}
          alt={`money bag ${state}`}
          width={92}
          height={92}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
          unoptimized
        />
      </div>
      <FloatingLabel text={label} left="62%" top="67%" />
    </>
  );
}
