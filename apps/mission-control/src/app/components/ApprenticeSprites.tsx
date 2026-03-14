'use client';

import Image from 'next/image';

interface Props {
  count: number;
}

// Apprentices spread around the platform edges
const SLOTS = [
  { left: '22%', top: '60%' },
  { left: '64%', top: '60%' },
  { left: '42%', top: '65%' },
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
            style={{ position: 'absolute', left: slot.left, top: slot.top, width: '9%' }}
          >
            <Image
              src="/sprites/apprentice.png"
              alt="apprentice"
              width={72}
              height={72}
              style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block' }}
              unoptimized
            />
          </div>
        );
      })}
    </>
  );
}
