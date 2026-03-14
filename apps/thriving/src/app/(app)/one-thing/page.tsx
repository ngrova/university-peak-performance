import React from 'react'
import { cookies } from 'next/headers'
import { createServerClient, getOneThingTask } from '@upp/db'
import FailureCostBadge from '@/components/ui/FailureCostBadge'
import OneThingActions from './OneThingActions'

export default async function OneThingPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies()
  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })

  const { data: { user } } = await supabase.auth.getUser()
  const task = user ? await getOneThingTask(supabase, user.id) : null

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text-primary)' }}
        >
          You&apos;re all caught up!
        </h1>
        <p style={{ color: 'var(--text-light)' }}>No pending tasks. Add some goals and tasks to get started.</p>
      </div>
    )
  }

  const goal = task.goals
  const pillar = goal.life_pillars

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-1"
        style={{ color: 'var(--accent)' }}
      >
        Focus on this
      </p>
      <h1
        className="text-4xl font-bold leading-tight mb-6"
        style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text-primary)' }}
      >
        {task.title}
      </h1>

      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color: pillar.color }}>{pillar.icon}</span>
          <span>{pillar.name}</span>
          <span style={{ color: 'var(--text-light)' }}>›</span>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{goal.title}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <FailureCostBadge cost={task.failure_cost} />
          {task.assignee && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: 'rgba(100,116,139,0.1)', color: '#64748B' }}
            >
              👤 {task.assignee}
            </span>
          )}
          {task.is_one_thing && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: '#D97706' }}
            >
              📌 Pinned
            </span>
          )}
        </div>

        {task.due_date && (
          <p className="text-sm" style={{ color: 'var(--text-light)' }}>
            📅 Due {new Date(`${task.due_date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}

        {task.notes && (
          <p className="text-sm border-t pt-3" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
            {task.notes}
          </p>
        )}
      </div>

      <OneThingActions taskId={task.id} taskTitle={task.title} wasPinned={task.is_one_thing} />
    </div>
  )
}
