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

export function MoneyBagSprite({ state, credits }: Props) {
  const src = moneyBagSrc(state);
  const label = `$${credits.toFixed(2)} ${STATE_LABELS[state]}`;

  return (
    <>
      <FloatingLabel text={label} left="70%" top="64%" />
      <div style={{ position: 'absolute', left: '74%', top: '68%', width: '5%' }}>
        <Image
          src={src}
          alt={`money bag ${state}`}
          width={92}
          height={92}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block', mixBlendMode: 'multiply' }}
          unoptimized
        />
      </div>
    </>
  );
}
