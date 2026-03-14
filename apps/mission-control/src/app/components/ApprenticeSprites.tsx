'use client';

import Image from 'next/image';

interface Props {
  count: number;
}

const SLOTS = [
  { left: '18%', top: '55%' },
  { left: '74%', top: '55%' },
  { left: '46%', top: '70%' },
] as const;

export function ApprenticeSprites({ count }: Props) {
  const visible = Math.min(count, 3);
  if (visible === 0) return null;

  return (
    <>
      {Array.from({ length: visible }).map((_, i) => {
        const slot = SLOTS[i]!;
        return (
          <div
            key={i}
            style={{ position: 'absolute', left: slot.left, top: slot.top, width: '4%' }}
          >
            <Image
              src="/sprites/apprentice.webp"
              alt="apprentice"
              width={72}
              height={72}
              style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block', mixBlendMode: 'multiply' }}
              unoptimized
            />
          </div>
        );
      })}
    </>
  );
}
