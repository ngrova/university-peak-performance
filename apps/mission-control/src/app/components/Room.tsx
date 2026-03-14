'use client';

import { useEffect, useRef, useState } from 'react';
import { AlbusSprite } from './AlbusSprite';
import { ApprenticeSprites } from './ApprenticeSprites';
import { albusState } from './sprite-state';

interface RoomProps {
  tokens: number;
  subagentCount: number;
  app: string;
  task: string;
}

export function Room({ tokens, subagentCount, app, task }: RoomProps) {
  const prevOutputRef = useRef(0);
  const [outputTokens, setOutputTokens] = useState(0);

  useEffect(() => { setOutputTokens(tokens); }, [tokens]);

  const aState = albusState(prevOutputRef.current, outputTokens);
  useEffect(() => { prevOutputRef.current = outputTokens; }, [outputTokens]);

  return (
    <div
      style={{
        position: 'relative',
        width: 800,
        height: 500,
        overflow: 'hidden',
        backgroundImage: 'url(/sprites/room.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
      }}
    >
      <AlbusSprite state={aState} app={app} task={task} />
      <ApprenticeSprites count={subagentCount} />
    </div>
  );
}
