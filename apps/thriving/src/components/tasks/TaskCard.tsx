'use client'
import React, { useState } from 'react'
import type { Task } from '@upp/db'
import { updateTaskStatusAction } from '@/actions/task-actions'
import TaskDetailSheet from './TaskDetailSheet'
import StatusIcon from './StatusIcon'
import CelebrationOverlay from '@/components/ui/CelebrationOverlay'

interface TaskCardProps {
  task: Task
  goalId: string
  pillarId: string
}

const PRIORITY_COLOR: Record<number, string> = {
  1: 'var(--danger)', 2: 'var(--warning)', 3: 'var(--accent)', 4: 'var(--text-muted)',
}
const PRIORITY_LABEL: Record<number, string> = { 1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4' }

export default function TaskCard({ task, goalId, pillarId }: TaskCardProps): React.JSX.Element {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  async function handleStatusToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (task.status !== 'done') {
      const next = task.status === 'todo' ? 'in_progress' : 'done'
      if (next === 'done') setShowCelebration(true)
    }
    await updateTaskStatusAction({ id: task.id, status: task.status }, goalId, pillarId)
  }

  const pb = { color: PRIORITY_COLOR[task.priority] ?? 'var(--text-muted)' }

  return (
    <>
      {showCelebration && <CelebrationOverlay taskTitle={task.title} onDismiss={() => setShowCelebration(false)} />}
      <TaskDetailSheet task={task} goalId={goalId} pillarId={pillarId} open={sheetOpen} onClose={() => setSheetOpen(false)} />

      <div
        className="rounded-xl flex items-center gap-3 cursor-pointer transition-opacity active:opacity-70"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '12px 14px', minHeight: '60px' }}
        onClick={() => setSheetOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setSheetOpen(true)}
        aria-label={`Task: ${task.title}`}
      >
        {/* Status toggle — large tap target */}
        <button
          onClick={handleStatusToggle}
          className="flex-shrink-0 flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ width: 44, height: 44, margin: -10 }}
          aria-label={`Status: ${task.status}`}
        >
          <StatusIcon status={task.status} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug ${task.status === 'done' ? 'line-through' : ''}`}
            style={{ color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)' }}
          >
            {task.title}
          </p>
          {task.due_date && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              🗓 {new Date(`${task.due_date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* One Thing badge */}
        {task.is_one_thing && (
          <span className="text-xs font-semibold flex-shrink-0 rounded px-1.5 py-0.5"
            style={{ color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
            ⭐ One Thing
          </span>
        )}

        {/* Priority badge */}
        <span
          className="text-xs font-semibold flex-shrink-0 rounded px-1.5 py-0.5"
          style={{ color: pb.color, backgroundColor: `color-mix(in srgb, ${pb.color} 15%, transparent)` }}
        >
          {PRIORITY_LABEL[task.priority] ?? 'P4'}
        </span>
      </div>
    </>
  )
}
