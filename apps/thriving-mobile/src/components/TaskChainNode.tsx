// ═══════════════════════════════════════════════════════════
// FILE: TaskChainNode.tsx
// PURPOSE: A single task node in the vertical task chain. Shows
//   different states: completed (green check + strikethrough),
//   current "up next" (bright border + label), or blocked
//   (dimmed, progressively more transparent further down).
// CALLED BY: components/TaskChain.tsx
// DATA FLOW: TaskChain passes a task + state info → user taps
//   → onTap opens the TaskDetailSheet via the Zustand store
// ═══════════════════════════════════════════════════════════
'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { Task } from '@upp/db';

interface TaskChainNodeProps {
  task: Task;
  isUpNext: boolean;
  chainIndex: number;
  upNextIndex: number;
  color: string;
  onTap: () => void;
}

/**
 * Triggered by: TaskChain renders one per task in the chain.
 * Steps: determines the task's visual state (done/up-next/future),
 *   dims tasks progressively after the up-next task, and renders
 *   a tappable node with the appropriate styling.
 * Returns: a styled task node element.
 */
export default function TaskChainNode({ task, isUpNext, chainIndex, upNextIndex, color, onTap }: TaskChainNodeProps): React.JSX.Element {
  const isDone = task.status === 'done';
  const distance = chainIndex - upNextIndex;
  const opacity = isDone ? 0.5 : isUpNext ? 1 : Math.max(0.3, 1 - distance * 0.15);

  return (
    <button type="button" onClick={onTap} aria-label={`Task: ${task.title}`}
      className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-left"
      style={{
        backgroundColor: isUpNext ? 'var(--bg-surface)' : 'transparent',
        border: isUpNext ? `1.5px solid ${color}` : '1.5px solid transparent',
        opacity, minHeight: '44px',
      }}>
      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: isDone ? 'var(--success)' : 'transparent',
          border: isDone ? 'none' : `2px solid ${isUpNext ? color : 'var(--text-muted)'}` }}>
        {isDone && <Check size={12} color="#fff" />}
      </div>
      <div className="flex-1 min-w-0">
        {isUpNext && (
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>Up next</span>
        )}
        <p className="text-sm truncate" style={{
          color: 'var(--text-primary)',
          textDecoration: isDone ? 'line-through' : 'none',
        }}>{task.title.length > 35 ? task.title.slice(0, 35) + '…' : task.title}</p>
      </div>
    </button>
  );
}
