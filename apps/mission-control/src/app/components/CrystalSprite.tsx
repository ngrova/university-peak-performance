'use client';

import Image from 'next/image';
import { FloatingLabel } from './FloatingLabel';
import { crystalSrc, crystalPulseDuration } from './sprite-state';
import type { CrystalState } from './sprite-state';

interface Props {
  state: CrystalState;
  pct: number;
}

// Crystal sits at the back-center of the platform (the concentric rings)
export function CrystalSprite({ state, pct }: Props) {
  const duration = crystalPulseDuration(state);
  const src = crystalSrc(state);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: '43%',
          top: '40%',
          width: '12%',
          animation: `crystalPulse ${duration}s ease-in-out infinite`,
          transformOrigin: 'center center',
        }}
      >
        <Image
          src={src}
          alt={`crystal ${state}`}
          width={92}
          height={92}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
          unoptimized
        />
      </div>
      <FloatingLabel text={`${pct}%`} left="46%" top="54%" />
    </>
  );
}
