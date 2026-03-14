'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { AlbusSprite } from './AlbusSprite';
import { ApprenticeSprites } from './ApprenticeSprites';
import { RewindFlash } from './RewindFlash';
import { SpellbookOverlay } from './SpellbookOverlay';
import { RewindButton } from './RewindButton';
import { StatusBars } from './StatusBars';
import { InfoStrip } from './InfoStrip';
import { albusState } from './sprite-state';
import type { RewindStateFile } from '../api/rewind/rewind-state-file';

const IDLE_REWIND: RewindStateFile = {
  status: 'idle', agentMessage: null, requestedAt: null, confirmedAt: null,
  stages: { memory: 'idle', clear: 'idle', restart: 'idle', verify: 'idle' },
};

interface SessionData { tokens: number; cap: number; percent: number; systemTokens: number; convoTokens: number; rewindSavings: number; rewindSavingsPct: number; }
interface SpendData   { usage: number; usageToday: number; }
interface ActivityData { app: string; task: string; lastCommitAt: string | null; }

function useSession(intervalMs: number) {
  const [data, setData] = useState<SessionData>({ tokens: 0, cap: 200_000, percent: 0, systemTokens: 0, convoTokens: 0, rewindSavings: 0, rewindSavingsPct: 0 });
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

function useSubagents(intervalMs: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const fetch_ = () => fetch('/api/subagents').then(r => r.json()).then((d: { count: number }) => setCount(d.count)).catch(() => {});
    fetch_();
    const id = setInterval(fetch_, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return count;
}

function useActivity(intervalMs: number) {
  const [activity, setActivity] = useState<ActivityData>({ app: 'Mission Control', task: 'Waiting for Nick...', lastCommitAt: null });
  useEffect(() => {
    const fetch_ = () =>
      fetch('/api/activity')
        .then(r => r.json())
        .then((d: ActivityData) => setActivity({
          app: d.app ?? 'Mission Control',
          task: d.task ?? 'Waiting for Nick...',
          lastCommitAt: d.lastCommitAt ?? null,
        }))
        .catch(() => {});
    fetch_();
    const id = setInterval(fetch_, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return activity;
}

export function Room() {
  const session = useSession(30_000);
  const spend   = useSpend(60_000);
  const rewind  = useRewindState();

  const prevOutputRef = useRef(0);
  const [outputTokens, setOutputTokens] = useState(0);

  useEffect(() => { setOutputTokens(session.tokens); }, [session.tokens]);

  const aState = albusState(prevOutputRef.current, outputTokens);
  useEffect(() => { prevOutputRef.current = outputTokens; }, [outputTokens]);

  const subagentCount = useSubagents(10_000);
  const activity = useActivity(30_000);

  const [showOverlay, setShowOverlay] = useState(false);

  const handleRewind = useCallback(async () => {
    await fetch('/api/rewind/request', { method: 'POST' });
    setShowOverlay(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    await fetch('/api/rewind/confirm', { method: 'POST' });
  }, []);

  const handleCancel = useCallback(async () => {
    await fetch('/api/rewind/cancel', { method: 'POST' });
    setShowOverlay(false);
  }, []);

  const handleClose = useCallback(() => setShowOverlay(false), []);

  useEffect(() => {
    if (rewind.status === 'done') {
      const id = setTimeout(async () => {
        await fetch('/api/rewind/cancel', { method: 'POST' });
        window.location.reload();
      }, 2_000);
      return () => clearTimeout(id);
    }
  }, [rewind.status]);

  return (
    <>
      <style>{`
        @keyframes rewindFlash {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Room */}
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
          <StatusBars
            tokens={session.tokens}
            cap={session.cap}
            percent={session.percent}
            systemTokens={session.systemTokens}
            convoTokens={session.convoTokens}
            rewindSavings={session.rewindSavings}
            rewindSavingsPct={session.rewindSavingsPct}
            usage={spend.usage}
            usageToday={spend.usageToday}
          />
          <AlbusSprite state={aState} />
          <ApprenticeSprites count={subagentCount} />
          <RewindFlash status={rewind.status} />
          <RewindButton status={rewind.status} onClick={handleRewind} />
        </div>

        {/* Info strip — below room, full width */}
        <InfoStrip
          app={activity.app}
          task={activity.task}
          lastCommitAt={activity.lastCommitAt}
          albusState={aState}
        />
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
