'use client';

import { useEffect, useRef, useState } from 'react';
import type { RewindStatus } from '../api/rewind/rewind-state-file';

interface Props {
  status: RewindStatus;
}

export function RewindFlash({ status }: Props) {
  const prevRef = useRef<RewindStatus>(status);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = status;
    if (prev !== 'done' && status === 'done') {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [status]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'white',
        pointerEvents: 'none',
        zIndex: 50,
        animation: 'rewindFlash 0.6s ease-in-out forwards',
      }}
    />
  );
}
