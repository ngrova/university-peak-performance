'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CrystalSprite } from './CrystalSprite';
import { MoneyBagSprite } from './MoneyBagSprite';
import { AlbusSprite } from './AlbusSprite';
import { ApprenticeSprites } from './ApprenticeSprites';
import { RewindFlash } from './RewindFlash';
import { SpellbookOverlay } from './SpellbookOverlay';
import { RewindButton } from './RewindButton';
import { crystalState, moneyBagState, albusState } from './sprite-state';
import type { RewindStateFile } from '../api/rewind/rewind-state-file';

const IDLE_REWIND: RewindStateFile = {
  status: 'idle', agentMessage: null, requestedAt: null, confirmedAt: null,
  stages: { memory: 'idle', clear: 'idle', restart: 'idle', verify: 'idle' },
};

interface SessionData { tokens: number; cap: number; percent: number; }
interface SpendData   { usage: number; usageToday: number; }

function useSession(intervalMs: number) {
  const [data, setData] = useState<SessionData>({ tokens: 0, cap: 200_000, percent: 0 });
  useEffect(() => {
    const fetch_ = () => fetch('/api/session').then(r => r.json()).then(setData).catch(() => {});
    fetch_();
    const id = setInterval(fetch_, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return data;
}

function useSpend(intervalMs: number) {
  const [data, setData] = useState<SpendData>({ usage: 0, usageToday: 0 });
  useEffect(() => {
    const fetch_ = () => fetch('/api/spend').then(r => r.json()).then(setData).catch(() => {});
    fetch_();
    const id = setInterval(fetch_, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return data;
}

function useRewindState() {
  const [state, setState] = useState<RewindStateFile>(IDLE_REWIND);
  useEffect(() => {
    const poll = () => fetch('/api/rewind/state').then(r => r.json()).then(setState).catch(() => {});
    poll();
    const id = setInterval(poll, 5_000);
    return () => clearInterval(id);
  }, []);
  return state;
}

export function Room() {
  const session = useSession(30_000);
  const spend   = useSpend(60_000);
  const rewind  = useRewindState();

  const prevOutputRef = useRef(0);
  const [outputTokens, setOutputTokens] = useState(0);

  // derive output tokens from session tokens as proxy
  useEffect(() => {
    setOutputTokens(session.tokens);
  }, [session.tokens]);

  const aState  = albusState(prevOutputRef.current, outputTokens);
  useEffect(() => { prevOutputRef.current = outputTokens; }, [outputTokens]);

  const cState  = crystalState(session.tokens, session.cap);
  const mState  = moneyBagState(spend.usage);
  const credits = spend.usage;
  const pct     = session.percent;

  // sub-agent count — not in current session API, default 0
  const subagentCount = 0;

  const [showOverlay, setShowOverlay] = useState(false);

  const handleRewind = useCallback(async () => {
    await fetch('/api/rewind/request', { method: 'POST' });
    setShowOverlay(true);
  }, []);

  const handleHardRewind = useCallback(async () => {
    await fetch('/api/rewind/restart', { method: 'POST' });
  }, []);

  const handleConfirm = useCallback(async () => {
    await fetch('/api/rewind/confirm', { method: 'POST' });
  }, []);

  const handleCancel = useCallback(async () => {
    await fetch('/api/rewind/cancel', { method: 'POST' });
    setShowOverlay(false);
  }, []);

  const handleClose = useCallback(() => setShowOverlay(false), []);

  return (
    <>
      <style>{`
        @keyframes crystalPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
        @keyframes rewindFlash {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
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
        <CrystalSprite state={cState} pct={pct} />
        <MoneyBagSprite state={mState} credits={credits} />
        <AlbusSprite state={aState} />
        <ApprenticeSprites count={subagentCount} />
        <RewindFlash status={rewind.status} />

        {/* Rewind button — bottom-right */}
        <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}>
          <RewindButton
            status={rewind.status}
            onRewind={handleRewind}
            onHardRewind={handleHardRewind}
          />
        </div>
      </div>

      {showOverlay && (
        <SpellbookOverlay
          state={rewind}
          onClose={handleClose}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
