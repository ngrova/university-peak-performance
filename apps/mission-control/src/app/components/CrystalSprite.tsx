'use client';

import Image from 'next/image';
import { FloatingLabel } from './FloatingLabel';
import { crystalSrc, crystalPulseDuration } from './sprite-state';
import type { CrystalState } from './sprite-state';

interface Props {
  state: CrystalState;
  pct: number;
}

export function CrystalSprite({ state, pct }: Props) {
  const duration = crystalPulseDuration(state);
  const src = crystalSrc(state);

  return (
    <>
      <FloatingLabel text="CRYSTAL" left="38%" top="47%" />
      <div
        style={{
          position: 'absolute',
          left: '42%',
          top: '55%',
          width: '5%',
          animation: `crystalPulse ${duration}s ease-in-out infinite`,
          transformOrigin: 'center center',
        }}
      >
        <Image
          src={src}
          alt={`crystal ${state}`}
          width={92}
          height={92}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block', mixBlendMode: 'multiply' }}
          unoptimized
        />
      </div>
      <FloatingLabel text={`${pct}%`} left="43%" top="62%" />
    </>
  );
}
