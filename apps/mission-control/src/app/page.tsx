'use client';

import { useEffect, useState, useCallback } from 'react';
import { Room } from './components/Room';
import { CrystalBall } from './components/CrystalBall';
import { Albus } from './components/Albus';
import type { AlbusState } from './components/Albus';
import { Apprentice } from './components/Apprentice';
import { Spellbook } from './components/Spellbook';
import { GoldPile } from './components/GoldPile';
import { DeskScroll } from './components/DeskScroll';

interface SessionEntry {
  updatedAt?: number;
  spawnDepth?: number;
  totalTokensFresh?: boolean;
}

interface SessionsFile {
  sessions?: SessionEntry[];
  [key: string]: unknown;
}

const ACTIVE_THRESHOLD_MS = 60_000;

function deriveAlbusState(updatedAt: number | null): AlbusState {
  if (!updatedAt) return 'waiting';
  return Date.now() - updatedAt < ACTIVE_THRESHOLD_MS ? 'active' : 'idle';
}

function parseSubAgents(raw: string): number {
  try {
    const parsed = JSON.parse(raw) as SessionsFile;
    const arr = Array.isArray(parsed.sessions)
      ? (parsed.sessions as SessionEntry[])
      : Object.values(parsed).filter((v): v is SessionEntry => typeof v === 'object' && v !== null);
    return arr.filter((s) => (s.spawnDepth ?? 0) > 0).length;
  } catch { return 0; }
}

export default function MissionControlPage() {
  const [albusState, setAlbusState] = useState<AlbusState>('idle');
  const [subAgentCount, setSubAgentCount] = useState(0);
  const [tokenPct, setTokenPct] = useState(0);

  const handlePercentChange = useCallback((p: number) => setTokenPct(p), []);

  useEffect(() => {
    const src = new EventSource('/api/session/stream');
    src.onmessage = (e) => {
      try {
        const raw = e.data as string;
        const data = JSON.parse(raw) as { updatedAt?: number };
        const updatedAt = data.updatedAt ?? null;
        if (updatedAt) sessionStorage.setItem('albus-last-updated', String(updatedAt));
        setAlbusState(deriveAlbusState(updatedAt));
        setSubAgentCount(parseSubAgents(raw));
      } catch { /* ignore */ }
    };
    return () => src.close();
  }, []);

  const isDark = tokenPct >= 75;

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1a0e06' }}>
      <Room isDark={isDark}>
        {/* ── Potions table (top-left area) ── */}
        <div style={{ position: 'absolute', top: 115, left: 24, display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          {[['#7c3aed','#4c1d95'],['#059669','#064e3b'],['#dc2626','#7f1d1d']].map(([c1,c2],i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 10, height: 14 + i * 4, background: c1, borderRadius: '2px 2px 0 0', border: `1px solid ${c2}` }} />
              <div style={{ width: 14, height: 4, background: c2, borderRadius: 1 }} />
            </div>
          ))}
        </div>

        {/* ── Albus's Desk (center-right) ── */}
        <div style={{ position: 'absolute', top: 130, left: 280 }}>
          <div style={{ width: 140, height: 60, background: '#5a3e1a', border: '3px solid #3a2010', borderRadius: 4, position: 'relative' }}>
            {/* desk surface line */}
            <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 2, background: '#7a5e3a' }} />
          </div>
        </div>

        {/* ── Crystal Ball on desk ── */}
        <div style={{ position: 'absolute', top: 108, left: 340 }}>
          <CrystalBall onPercentChange={handlePercentChange} />
        </div>

        {/* ── Albus sprite at desk ── */}
        <div style={{ position: 'absolute', top: albusState === 'waiting' ? 120 : 148, left: albusState === 'waiting' ? 460 : 300, transition: 'left 0.6s, top 0.6s' }}>
          <Albus state={albusState} />
        </div>

        {/* ── Spellbook Stand (lower-left) ── */}
        <div style={{ position: 'absolute', top: 230, left: 40 }}>
          <Spellbook />
        </div>

        {/* ── Phoenix Perch (lower-right area) ── */}
        <div style={{ position: 'absolute', top: 220, right: 28 }}>
          <svg width="40" height="52" viewBox="0 0 40 52" style={{ imageRendering: 'pixelated' }}>
            {/* perch pole */}
            <rect x="18" y="20" width="4" height="30" fill="#5a3e1a" />
            <rect x="10" y="48" width="20" height="4" rx="2" fill="#3a2010" />
            <rect x="8" y="20" width="24" height="4" rx="2" fill="#5a3e1a" />
            {/* phoenix (simplified) */}
            <ellipse cx="20" cy="14" rx="8" ry="6" fill="#f97316" />
            <polygon points="20,2 16,10 24,10" fill="#fbbf24" />
            <circle cx="22" cy="12" r="1.5" fill="#1a1a1a" />
            {/* tail feathers */}
            <path d="M12 18 Q8 28 10 32" stroke="#ef4444" strokeWidth="2" fill="none" />
            <path d="M20 20 Q18 30 20 34" stroke="#f97316" strokeWidth="2" fill="none" />
            <path d="M28 18 Q32 28 30 32" stroke="#fbbf24" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* ── Sub-agent Apprentices ── */}
        {subAgentCount > 0 && (
          <div style={{ position: 'absolute', bottom: 70, left: 100, display: 'flex', gap: 16 }}>
            {Array.from({ length: Math.min(subAgentCount, 3) }).map((_, i) => (
              <Apprentice key={i} index={i} />
            ))}
          </div>
        )}

        {/* ── Gold Bags (bottom-right) ── */}
        <div style={{ position: 'absolute', bottom: 16, right: 24 }}>
          <GoldPile />
        </div>

        {/* ── Desk Scroll (bottom-center-right) ── */}
        <div style={{ position: 'absolute', bottom: 90, right: 60 }}>
          <DeskScroll />
        </div>
      </Room>
    </main>
  );
}
