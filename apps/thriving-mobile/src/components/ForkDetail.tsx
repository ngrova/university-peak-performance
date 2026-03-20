// ═══════════════════════════════════════════════════════════
// FILE: ForkDetail.tsx
// PURPOSE: Shows the list of parallel tracks when a user taps a
//   fork node in the task chain. Each track shows its name, task
//   count, and a chevron to drill into that track's sub-chain.
// CALLED BY: components/TreeContent.tsx
// DATA FLOW: TreeContent passes fork tracks from the chain data
//   → user taps a track → onTrackTap drills into that sub-chain
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  taskCount: number;
}

interface ForkDetailProps {
  tracks: Track[];
  color: string;
  onTrackTap: (id: string, title: string) => void;
}

/**
 * Triggered by: TreeContent renders this at the fork drill-down level.
 * Steps: renders each parallel track as a tappable row with name,
 *   task count, and chevron.
 * Returns: a vertical list of track rows.
 */
export default function ForkDetail({ tracks, color, onTrackTap }: ForkDetailProps): React.JSX.Element {
  if (tracks.length === 0) {
    return <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No parallel tracks</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {tracks.map((track) => (
        <button key={track.id} type="button" onClick={() => onTrackTap(track.id, track.title)}
          aria-label={`Track: ${track.title}`}
          className="flex items-center justify-between rounded-xl p-4"
          style={{ backgroundColor: 'var(--bg-surface)', minHeight: '44px' }}>
          <div className="flex-1 min-w-0 mr-2">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{track.title}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{track.taskCount} tasks</p>
          </div>
          <ChevronRight size={16} style={{ color, flexShrink: 0 }} />
        </button>
      ))}
    </div>
  );
}
