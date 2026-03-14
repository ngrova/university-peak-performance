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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">You&apos;re all caught up!</h1>
        <p className="text-gray-500">No pending tasks. Add some goals and tasks to get started.</p>
      </div>
    )
  }

  const goal = task.goals
  const pillar = goal.life_pillars

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <p className="text-sm font-medium text-indigo-600 mb-1 uppercase tracking-wider">Focus on this</p>
      <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-6">{task.title}</h1>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span style={{ color: pillar.color }}>{pillar.icon}</span>
          <span>{pillar.name}</span>
          <span className="text-gray-400">›</span>
          <span className="font-medium text-gray-700">{goal.title}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <FailureCostBadge cost={task.failure_cost} />
          {task.assignee && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
              👤 {task.assignee}
            </span>
          )}
          {task.is_one_thing && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
              📌 Pinned
            </span>
          )}
        </div>

        {task.due_date && (
          <p className="text-sm text-gray-500">
            📅 Due {new Date(`${task.due_date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}

        {task.notes && (
          <p className="text-sm text-gray-600 border-t pt-3">{task.notes}</p>
        )}
      </div>

      <OneThingActions taskId={task.id} wasPinned={task.is_one_thing} />
    </div>
  )
}
