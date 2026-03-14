'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { SubagentInfo } from '../api/subagents/route';

interface Props {
  subagents: SubagentInfo[];
}

// Up to 3 fixed slots on the inner deck of the terrace platform
// Pulled inward and upward to sit on the wooden floor, not the outer rail
const SLOTS = [
  { left: '28%', top: '48%' },
  { left: '58%', top: '48%' },
  { left: '43%', top: '55%' },
] as const;

function Poof({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        animation: 'poofAnim 0.6s ease-out forwards',
        pointerEvents: 'none',
      }}
    >
      ✨
    </div>
  );
}

interface SlotState {
  subagent: SubagentInfo | null;
  showPoof: boolean;
}

export function ApprenticeSprites({ subagents }: Props) {
  const MAX = SLOTS.length;
  // Track which subagent id was in each slot last render
  const prevIds = useRef<(string | null)[]>([null, null, null]);
  const [slots, setSlots] = useState<SlotState[]>([
    { subagent: null, showPoof: false },
    { subagent: null, showPoof: false },
    { subagent: null, showPoof: false },
  ]);

  useEffect(() => {
    // Assign active subagents to slots (up to MAX)
    const active = subagents.filter((s) => s.active).slice(0, MAX);

    setSlots((prev) =>
      prev.map((slot, i) => {
        const current = active[i] ?? null;
        const prevId = prevIds.current[i];
        const currentId = current?.id ?? null;
        // New subagent appeared in this slot → poof
        const showPoof = currentId !== null && currentId !== prevId;
        return { subagent: current, showPoof };
      })
    );

    prevIds.current = active.map((s) => s?.id ?? null);
    // Pad remaining slots with null
    while (prevIds.current.length < MAX) prevIds.current.push(null);
  }, [subagents]);

  const clearPoof = (i: number) => {
    setSlots((prev) =>
      prev.map((slot, idx) => (idx === i ? { ...slot, showPoof: false } : slot))
    );
  };

  return (
    <>
      <style>{`
        @keyframes poofAnim {
          0%   { opacity: 1; transform: scale(0.5); }
          50%  { opacity: 1; transform: scale(1.4); }
          100% { opacity: 0; transform: scale(1.8); }
        }
        @keyframes apprenticeFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {slots.map((slot, i) => {
        const pos = SLOTS[i]!;
        if (!slot.subagent && !slot.showPoof) return null;

        const isStale = slot.subagent ? !slot.subagent.active : false;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              width: '13%',
              opacity: isStale ? 0.3 : 1,
              transition: 'opacity 1.5s ease',
            }}
          >
            {slot.subagent && (
              <Image
                src="/sprites/apprentice.png"
                alt={`Apprentice ${i + 1}`}
                width={110}
                height={110}
                style={{
                  width: '100%',
                  height: 'auto',
                  imageRendering: 'pixelated',
                  display: 'block',
                  animation: 'apprenticeFadeIn 0.4s ease-out',
                }}
                unoptimized
              />
            )}
            {slot.showPoof && <Poof onDone={() => clearPoof(i)} />}
          </div>
        );
      })}
    </>
  );
}
