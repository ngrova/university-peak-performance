'use client';

import { useEffect, useState } from 'react';

interface SpendData {
  usage: number;
  usageToday: number;
}

const DAILY_BUDGET = 5;
const SEALED_BAG_CHUNK = 15;
const COIN_ACTIVE_MS = 5 * 60 * 1000;

function useCoinActive(): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const check = () => {
      try {
        const raw = sessionStorage.getItem('albus-last-updated');
        if (!raw) return setActive(false);
        setActive(Date.now() - Number(raw) < COIN_ACTIVE_MS);
      } catch { setActive(false); }
    };
    check();
    const id = setInterval(check, 15_000);
    return () => clearInterval(id);
  }, []);
  return active;
}

function SealedBag() {
  return (
    <svg width="28" height="30" viewBox="0 0 28 30" style={{ imageRendering: 'pixelated', opacity: 0.6 }}>
      <ellipse cx="14" cy="22" rx="11" ry="8" fill="#8B6914" />
      <ellipse cx="14" cy="22" rx="11" ry="8" fill="none" stroke="#5a3e0a" strokeWidth="1.5" />
      <path d="M8 18 Q14 10 20 18" fill="#a07820" stroke="#5a3e0a" strokeWidth="1.5" />
      {/* tied knot */}
      <circle cx="14" cy="12" r="3" fill="#c8920a" stroke="#5a3e0a" strokeWidth="1" />
      <line x1="12" y1="10" x2="10" y2="7" stroke="#5a3e0a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="10" x2="18" y2="7" stroke="#5a3e0a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function OpenBag({ fillPct, coinsActive }: { fillPct: number; coinsActive: boolean }) {
  const fillH = Math.round(Math.max(2, Math.min(16, fillPct * 16)));
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* falling coins */}
      <div className={coinsActive ? 'coins-falling' : ''} style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 14, pointerEvents: 'none' }}>
        <div className="coin-1" style={{ position: 'absolute', top: 0, left: 4, width: 7, height: 4, borderRadius: '50%', background: '#fbbf24', border: '1px solid #d97706', opacity: 0 }} />
        <div className="coin-2" style={{ position: 'absolute', top: 0, left: 10, width: 6, height: 4, borderRadius: '50%', background: '#fcd34d', border: '1px solid #d97706', opacity: 0 }} />
      </div>
      <svg width="36" height="40" viewBox="0 0 36 40" style={{ imageRendering: 'pixelated' }}>
        {/* bag body */}
        <ellipse cx="18" cy="30" rx="14" ry="10" fill="#a07820" />
        <ellipse cx="18" cy="30" rx="14" ry="10" fill="none" stroke="#5a3e0a" strokeWidth="1.5" />
        {/* fill level */}
        <clipPath id="bag-clip">
          <ellipse cx="18" cy="30" rx="13" ry="9" />
        </clipPath>
        <rect x="5" y={38 - fillH} width="26" height={fillH} fill="#fbbf24" clipPath="url(#bag-clip)" />
        {/* open top */}
        <path d="M10 22 Q18 14 26 22" fill="#b88a28" stroke="#5a3e0a" strokeWidth="1.5" />
        <path d="M10 22 Q18 20 26 22" fill="none" stroke="#fbbf24" strokeWidth="1" />
      </svg>
    </div>
  );
}

function FillBar({ pct }: { pct: number }) {
  return (
    <div style={{ width: 48, height: 4, background: '#3a2618', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, pct * 100)}%`, background: '#fbbf24', borderRadius: 2, transition: 'width 0.5s' }} />
    </div>
  );
}

export function GoldPile() {
  const [data, setData] = useState<SpendData>({ usage: 0, usageToday: 0 });
  const coinsActive = useCoinActive();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/spend');
        if (res.ok) setData(await res.json() as SpendData);
      } catch { /* ignore */ }
    };
    void load();
    const id = setInterval(() => void load(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const sealedCount = Math.max(0, Math.floor(data.usage / SEALED_BAG_CHUNK));
  const fillPct = Math.min(1, data.usageToday / DAILY_BUDGET);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div className="pixel-text" style={{ fontSize: 8, color: '#d97706', textAlign: 'center', lineHeight: 1.4 }}>
        ${data.usage.toFixed(2)} total
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        {Array.from({ length: Math.min(sealedCount, 3) }).map((_, i) => (
          <SealedBag key={i} />
        ))}
        <OpenBag fillPct={fillPct} coinsActive={coinsActive} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div className="pixel-text" style={{ fontSize: 8, color: '#fbbf24' }}>${data.usageToday.toFixed(2)} today</div>
        <FillBar pct={fillPct} />
      </div>
    </div>
  );
}
