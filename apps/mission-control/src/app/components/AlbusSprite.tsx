'use client';

import Image from 'next/image';
import { albusSrc } from './sprite-state';
import type { AlbusStateSprite } from './sprite-state';

interface Props {
  state: AlbusStateSprite;
}

export function AlbusSprite({ state }: Props) {
  const src = albusSrc(state);

  return (
    <>
      <style>{`
        @keyframes albusFloat {
          0%   { transform: translateX(0px)   translateY(0px); }
          25%  { transform: translateX(12px)  translateY(-6px); }
          50%  { transform: translateX(24px)  translateY(0px); }
          75%  { transform: translateX(12px)  translateY(-6px); }
          100% { transform: translateX(0px)   translateY(0px); }
        }
        @keyframes albusFloatCoding {
          0%   { transform: translateX(0px)   translateY(0px); }
          20%  { transform: translateX(-10px) translateY(-4px); }
          50%  { transform: translateX(-20px) translateY(0px); }
          80%  { transform: translateX(-10px) translateY(-4px); }
          100% { transform: translateX(0px)   translateY(0px); }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          left: '42%',
          top: '50%',
          width: '13%',
          animation: state === 'coding'
            ? 'albusFloatCoding 6s ease-in-out infinite'
            : 'albusFloat 8s ease-in-out infinite',
        }}
      >
        <Image
          src={src}
          alt={`Albus ${state}`}
          width={120}
          height={120}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
          unoptimized
        />
      </div>
    </>
  );
}
