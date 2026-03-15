'use client';

import { useEffect, useState } from 'react';

export function usePoll<T>(url: string, interval: number, init: T): T {
  const [data, setData] = useState<T>(init);
  useEffect(() => {
    const go = () =>
      fetch(url)
        .then((r) => r.json())
        .then(setData)
        .catch(() => {});
    go();
    const id = setInterval(go, interval);
    return () => clearInterval(id);
  }, [url, interval]);
  return data;
}
