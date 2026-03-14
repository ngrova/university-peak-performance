'use client';

import { useEffect, useRef, useState } from 'react';
import { CrystalSprite } from './CrystalSprite';
import { MoneyBagSprite } from './MoneyBagSprite';
import { AlbusSprite } from './AlbusSprite';
import { ApprenticeSprites } from './ApprenticeSprites';
import { crystalState, moneyBagState, albusState } from './sprite-state';

interface RoomProps {
  tokens: number;
  cap: number;
  percent: number;
  creditsUsage: number;
  subagentCount: number;
  app: string;
  task: string;
}

export function Room({ tokens, cap, percent, creditsUsage, subagentCount, app, task }: RoomProps) {
  const prevOutputRef = useRef(0);
  const [outputTokens, setOutputTokens] = useState(0);

  useEffect(() => { setOutputTokens(tokens); }, [tokens]);

  const aState = albusState(prevOutputRef.current, outputTokens);
  useEffect(() => { prevOutputRef.current = outputTokens; }, [outputTokens]);

  const cState = crystalState(tokens, cap);
  const mState = moneyBagState(creditsUsage);

  return (
    <>
      <style>{`
        @keyframes crystalPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes rewindFlash { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
      <div
        style={{
          position: 'relative',
          width: 800,
          height: 800,
          overflow: 'hidden',
          backgroundImage: 'url(/sprites/room.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <CrystalSprite state={cState} pct={percent} />
        <MoneyBagSprite state={mState} credits={creditsUsage} />
        <AlbusSprite state={aState} app={app} task={task} />
        <ApprenticeSprites count={subagentCount} />
      </div>
    </>
  );
}
