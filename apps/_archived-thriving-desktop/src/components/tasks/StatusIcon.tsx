import React from 'react'
import type { Task } from '@upp/db'

const CONFIGS: Record<string, { color: string; d: string }> = {
  todo: { color: 'var(--text-muted)', d: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Z' },
  in_progress: { color: 'var(--accent)', d: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm0 16V6a6 6 0 0 1 0 12Z' },
  done: { color: 'var(--success)', d: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm-1 14.4-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7Z' },
  blocked: { color: 'var(--danger)', d: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm1 14h-2v-2h2v2Zm0-4h-2V7h2v5Z' },
}

const DEFAULT_CFG = CONFIGS.todo!

// Renders the circle status icon for a task
export default function StatusIcon({ status }: { status: Task['status'] }): React.JSX.Element {
  const cfg = CONFIGS[status] ?? DEFAULT_CFG
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={cfg.color}>
      <path d={cfg.d} />
    </svg>
  )
}
