'use client';

import { useEffect, useState } from 'react';

interface ActivityData {
  currentTask: string;
  lastAction: string;
}

const FALLBACK: ActivityData = { currentTask: 'Idle', lastAction: '—' };

export function DeskScroll() {
  const [data, setData] = useState<ActivityData>(FALLBACK);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/activity');
        if (res.ok) setData(await res.json() as ActivityData);
      } catch { /* ignore */ }
    };
    void load();
    const id = setInterval(() => void load(), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      background: '#d4a96a', border: '2px solid #8b6914', borderRadius: 4,
      padding: '6px 10px', width: 140, boxShadow: '2px 2px 0 #5a3e0a',
    }}>
      {/* scroll curl top */}
      <div style={{ height: 4, background: '#c49050', borderRadius: '2px 2px 0 0', marginBottom: 4, border: '1px solid #8b6914' }} />
      <div className="pixel-text" style={{ fontSize: 8, color: '#3a2010', marginBottom: 4 }}>
        <span style={{ color: '#5a3e0a' }}>NOW: </span>{data.currentTask}
      </div>
      <div className="pixel-text" style={{ fontSize: 8, color: '#5a3e1a' }}>
        <span style={{ color: '#5a3e0a' }}>LAST: </span>{data.lastAction}
      </div>
      {/* scroll curl bottom */}
      <div style={{ height: 4, background: '#c49050', borderRadius: '0 0 2px 2px', marginTop: 4, border: '1px solid #8b6914' }} />
    </div>
  );
}
