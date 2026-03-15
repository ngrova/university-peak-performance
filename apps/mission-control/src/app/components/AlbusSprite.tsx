'use client';

import Image from 'next/image';
import type { AlbusStateSprite } from './sprite-state';

const PIXEL = "'Press Start 2P', monospace";

interface Props {
  state: AlbusStateSprite;
}

export function AlbusSprite({ state }: Props) {
  const isCoding = state === 'coding';

  return (
    <>
      <style>{`
        @keyframes albusFloat {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-8px); }
        }
      `}</style>

      {/* Albus sprite */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          width: 160,
          animation: 'albusFloat 3s ease-in-out infinite',
        }}
      >
        <Image
          src="/sprites/albus.png"
          alt="Albus"
          width={160}
          height={160}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
          unoptimized
        />
      </div>

      {/* CODING / IDLE badge — centered under Albus */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 'calc(38% + 120px)',
          transform: 'translateX(-50%)',
          fontFamily: PIXEL,
          fontSize: 10,
          fontWeight: 'bold',
          padding: '4px 10px',
          borderRadius: 3,
          background: isCoding ? 'rgba(60,160,60,0.30)' : 'rgba(60,100,160,0.30)',
          color: isCoding ? '#60c860' : '#6090c0',
          border: `1px solid ${isCoding ? 'rgba(96,200,96,0.4)' : 'rgba(96,144,192,0.4)'}`,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {isCoding ? '◉ CODING' : '○ IDLE'}
      </div>
    </>
  );
}
