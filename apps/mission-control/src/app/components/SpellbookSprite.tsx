'use client';

import type { RewindStateFile } from '../api/rewind/rewind-state-file';

interface Props {
  status: RewindStateFile['status'];
  onClick: () => void;
}

const IDLE_STATES: RewindStateFile['status'][] = ['idle', 'done', 'failed'];

export function SpellbookSprite({ status, onClick }: Props) {
  const isClickable = IDLE_STATES.includes(status);

  return (
    <>
      <style>{`
        @keyframes spellbookFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes spellbookBusy {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        .spellbook-sprite {
          animation: spellbookFloat 3s ease-in-out infinite;
        }
        .spellbook-sprite.busy {
          animation: spellbookBusy 1s ease-in-out infinite;
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          left: '22%',
          top: '60%',
          width: '9%',
          zIndex: 5,
          cursor: isClickable ? 'pointer' : 'default',
          userSelect: 'none',
        }}
        onClick={isClickable ? onClick : undefined}
        title={isClickable ? 'Click to rewind' : 'Rewind in progress...'}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sprites/spellbook.webp"
          alt="Spellbook — click to rewind"
          className={`spellbook-sprite${isClickable ? '' : ' busy'}`}
          style={{
            width: '100%',
            imageRendering: 'pixelated',
            display: 'block',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-18px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px',
            color: isClickable ? '#fbbf24' : '#888',
            textShadow: '1px 1px 2px black',
            whiteSpace: 'nowrap',
          }}
        >
          {isClickable ? '✦ REWIND' : 'casting...'}
        </div>
      </div>
    </>
  );
}
