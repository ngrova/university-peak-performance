'use client';

import { useEffect, useState } from 'react';

interface SessionData {
  tokens: number;
  cap: number;
  percent: number;
}

const REFRESH_MS = 30_000;
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function gaugeColor(percent: number): string {
  if (percent >= 80) return '#F87171';
  if (percent >= 50) return '#FACC15';
  return '#4ADE80';
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function ContextGauge() {
  const [data, setData] = useState<SessionData>({ tokens: 0, cap: 200_000, percent: 0 });
  const [error, setError] = useState(false);

  async function fetchSession() {
    try {
      const res = await fetch('/api/session');
      if (!res.ok) throw new Error('fetch failed');
      const json: SessionData = await res.json() as SessionData;
      setData(json);
      setError(false);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    void fetchSession();
    const id = setInterval(() => void fetchSession(), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const dashOffset = CIRCUMFERENCE * (1 - data.percent / 100);
  const color = gaugeColor(data.percent);

  return (
    <section className="flex flex-col items-center gap-4">
      <h2 className="text-xs uppercase tracking-widest text-[#E5E5E5]/40">Context</h2>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#1a1a1a" strokeWidth="12" />
        <circle
          cx="100" cy="100" r={RADIUS}
          fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
        <text x="100" y="95" textAnchor="middle" fill="#E5E5E5" fontSize="22" fontFamily="monospace" fontWeight="bold">
          {formatTokens(data.tokens)}
        </text>
        <text x="100" y="118" textAnchor="middle" fill={color} fontSize="13" fontFamily="monospace">
          {data.percent}%
        </text>
      </svg>
      {error && <p className="text-xs text-[#F87171]">Could not fetch session data</p>}
    </section>
  );
}
