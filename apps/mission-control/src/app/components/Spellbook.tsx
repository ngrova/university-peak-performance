'use client';

import { useEffect, useState, useCallback } from 'react';
import type { RewindStateFile } from '../api/rewind/rewind-state-file';
import { SpellbookOverlay } from './SpellbookOverlay';

const IDLE_STATE: RewindStateFile = {
  status: 'idle',
  agentMessage: null,
  requestedAt: null,
  confirmedAt: null,
  stages: { memory: 'idle', clear: 'idle', restart: 'idle', verify: 'idle' },
};

async function post(path: string): Promise<void> {
  await fetch(path, { method: 'POST' });
}

export function Spellbook() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<RewindStateFile>(IDLE_STATE);

  useEffect(() => {
    const src = new EventSource('/api/rewind/state/stream');
    src.onmessage = (e) => {
      try { setState(JSON.parse(e.data as string) as RewindStateFile); } catch { /* ignore */ }
    };
    return () => src.close();
  }, []);

  // Auto-open overlay when rewind is triggered externally
  useEffect(() => {
    if (state.status !== 'idle') setOpen(true);
  }, [state.status]);

  const handleOpen = useCallback(async () => {
    setOpen(true);
    if (state.status === 'idle') await post('/api/rewind/request');
  }, [state.status]);

  const handleConfirm = useCallback(() => void post('/api/rewind/confirm'), []);
  const handleCancel = useCallback(() => void post('/api/rewind/cancel'), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        onClick={() => void handleOpen()}
        title="Open Spellbook — Rewind"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
      >
        <svg width="52" height="44" viewBox="0 0 52 44" style={{ imageRendering: 'pixelated' }}>
          {/* open book left page */}
          <rect x="2" y="8" width="22" height="30" rx="1" fill="#f5e6c8" stroke="#8b6914" strokeWidth="1.5" />
          <line x1="8" y1="14" x2="20" y2="14" stroke="#8b6914" strokeWidth="1" />
          <line x1="8" y1="18" x2="20" y2="18" stroke="#8b6914" strokeWidth="1" />
          <line x1="8" y1="22" x2="18" y2="22" stroke="#8b6914" strokeWidth="1" />
          <line x1="8" y1="26" x2="20" y2="26" stroke="#8b6914" strokeWidth="1" />
          {/* spine */}
          <rect x="23" y="6" width="6" height="34" rx="1" fill="#8b6914" />
          {/* right page */}
          <rect x="28" y="8" width="22" height="30" rx="1" fill="#f5e6c8" stroke="#8b6914" strokeWidth="1.5" />
          {/* rune symbols on right page */}
          <text x="32" y="20" fontSize="8" fill="#4a2a0a" fontFamily="serif">✦ ☽</text>
          <text x="32" y="30" fontSize="8" fill="#4a2a0a" fontFamily="serif">⚡ ★</text>
          {/* stand */}
          <rect x="18" y="38" width="16" height="4" rx="1" fill="#5a3e0a" />
          <rect x="14" y="40" width="24" height="3" rx="1" fill="#3a2005" />
        </svg>
        <div className="pixel-text" style={{ fontSize: 8, color: '#d4a96a' }}>REWIND</div>
      </button>

      {open && (
        <SpellbookOverlay
          state={state}
          onClose={handleClose}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
