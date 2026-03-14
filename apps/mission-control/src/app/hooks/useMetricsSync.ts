'use client';

import { useEffect, useRef } from 'react';

interface MetricsSyncParams {
  date: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalSpend: number;
  prsMerged: number;
  maxContextPercent: number;
}

const SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function useMetricsSync(params: MetricsSyncParams) {
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    const sync = () => {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paramsRef.current),
      }).catch(() => {});
    };

    sync(); // initial sync
    const id = setInterval(sync, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, []); // only once
}
