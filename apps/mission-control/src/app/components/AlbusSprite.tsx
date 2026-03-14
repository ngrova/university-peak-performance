'use client';

import Image from 'next/image';
import { ThoughtBubble } from './ThoughtBubble';
import { albusSrc } from './sprite-state';
import type { AlbusStateSprite } from './sprite-state';

interface Props {
  state: AlbusStateSprite;
  app?: string;
  task?: string;
}

const POS = { left: '38%', top: '38%' };

export function AlbusSprite({ state, app, task }: Props) {
  const src = albusSrc(state);

  return (
    <>
      <style>{`
        @keyframes albusFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
      <div style={{
        position: 'absolute',
        left: POS.left,
        top: POS.top,
        width: '14%',
        animation: 'albusFloat 3s ease-in-out infinite',
        overflow: 'visible',
      }}>
        {(app || task) && (
          <ThoughtBubble app={app ?? ''} task={task ?? ''} left="110%" top="-60%" />
        )}
        <Image
          src={src}
          alt={`Albus ${state}`}
          width={96}
          height={96}
          style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
          unoptimized
        />
      </div>
    </>
  );
}
