'use client';

import Image from 'next/image';
import type { AlbusStateSprite } from './sprite-state';

interface Props {
  state: AlbusStateSprite;
}

export function AlbusSprite({ state: _state }: Props) {
  return (
    <>
      <style>{`
        @keyframes albusFloat {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-8px); }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '32%',
          width: 150,
          animation: 'albusFloat 3s ease-in-out infinite',
        }}
      >
        <Image
          src="/sprites/albus.png"
          alt="Albus"
          width={150}
          height={150}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
          unoptimized
        />
      </div>
    </>
  );
}
