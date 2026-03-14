'use client';

import { useEffect, useState } from 'react';

interface SessionData {
  tokens: number;
  cap: number;
  percent: number;
}

export type CrystalClass = 'crystal-calm' | 'crystal-gentle' | 'crystal-warm' | 'crystal-hot' | 'crystal-danger';

export function crystalClass(percent: number): CrystalClass {
  if (percent >= 90) return 'crystal-danger';
  if (percent >= 75) return 'crystal-hot';
  if (percent >= 50) return 'crystal-warm';
  if (percent >= 25) return 'crystal-gentle';
  return 'crystal-calm';
}

export type CrystalColor = { inner: string; outer: string };

function crystalColors(percent: number): CrystalColor {
  if (percent >= 90) return { inner: '#fca5a5', outer: '#ef4444' };
  if (percent >= 75) return { inner: '#fdba74', outer: '#f97316' };
  if (percent >= 50) return { inner: '#fcd34d', outer: '#f59e0b' };
  if (percent >= 25) return { inner: '#5eead4', outer: '#14b8a6' };
  return { inner: '#93c5fd', outer: '#3b82f6' };
}

function formatK(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
}

interface Props {
  onPercentChange?: (p: number) => void;
}

export function CrystalBall({ onPercentChange }: Props) {
  const [data, setData] = useState<SessionData>({ tokens: 0, cap: 200_000, percent: 0 });
  const cls = crystalClass(data.percent);
  const colors = crystalColors(data.percent);

  useEffect(() => {
    const src = new EventSource('/api/session/stream');
    src.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data as string) as SessionData;
        setData(parsed);
        onPercentChange?.(parsed.percent);
      } catch { /* ignore */ }
    };
    return () => src.close();
  }, [onPercentChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div className={`pixel-text ${cls}`} style={{ fontSize: 9, color: colors.outer, letterSpacing: 1 }}>
        {formatK(data.tokens)} / {formatK(data.cap)}
      </div>
      <div className={cls} style={{ position: 'relative', width: 64, height: 64 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <defs>
            <radialGradient id="orb" cx="38%" cy="32%" r="60%">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="35%" stopColor={colors.inner} stopOpacity="0.95" />
              <stop offset="100%" stopColor={colors.outer} stopOpacity="1" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill={`url(#orb)`} />
          <ellipse cx="26" cy="24" rx="7" ry="4" fill="white" fillOpacity="0.4" />
          {/* pedestal */}
          <rect x="22" y="58" width="20" height="4" rx="2" fill="#5a3e28" />
          <rect x="20" y="60" width="24" height="3" rx="1" fill="#3a2618" />
        </svg>
      </div>
      <div className="pixel-text" style={{ fontSize: 8, color: '#a87d55' }}>{data.percent}%</div>
    </div>
  );
}
