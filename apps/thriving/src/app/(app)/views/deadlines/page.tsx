import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient, getTasksWithDeadlines } from '@upp/db'
import type { TaskWithContext } from '@upp/db'
import FailureCostBadge from '@/components/ui/FailureCostBadge'

type DeadlineGroup = 'Overdue' | 'This Week' | 'This Month' | 'Later'

function classifyTask(dueDate: string, today: string): DeadlineGroup {
  if (dueDate < today) return 'Overdue'
  const dayMs = 86400000
  const diffDays = (new Date(dueDate).getTime() - new Date(today).getTime()) / dayMs
  if (diffDays <= 7) return 'This Week'
  if (diffDays <= 30) return 'This Month'
  return 'Later'
}

const GROUP_ORDER: DeadlineGroup[] = ['Overdue', 'This Week', 'This Month', 'Later']

const GROUP_STYLES: Record<DeadlineGroup, string> = {
  Overdue: 'text-red-600',
  'This Week': 'text-orange-600',
  'This Month': 'text-yellow-700',
  Later: 'text-gray-600',
}

function TaskRow({ task }: { task: TaskWithContext }): React.JSX.Element {
  const goal = task.goals
  const goalDetailHref = `/pillars/${goal.pillar_id}/goals/${task.goal_id}`

  return (
    <Link
      href={goalDetailHref}
      className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-indigo-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
        <p className="text-xs text-gray-500">{goal.title}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <FailureCostBadge cost={task.failure_cost} />
        {task.assignee && (
          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{task.assignee}</span>
        )}
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {new Date(`${task.due_date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </Link>
  )
}

export default async function DeadlinesPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies()
  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })

  const { data: { user } } = await supabase.auth.getUser()
  const tasks = user ? await getTasksWithDeadlines(supabase, user.id) : []
  const today = new Date().toISOString().slice(0, 10)

  const grouped = tasks.reduce<Record<DeadlineGroup, TaskWithContext[]>>(
    (acc, task) => {
      const group = classifyTask(task.due_date!, today)
      acc[group].push(task)
      return acc
    },
    { Overdue: [], 'This Week': [], 'This Month': [], Later: [] },
  )

  const hasAny = tasks.length > 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📅 Deadlines</h1>
      {!hasAny ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No tasks with deadlines.</p>
          <p>Assign due dates to tasks to see them here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {GROUP_ORDER.map((group) => {
            const groupTasks = grouped[group]
            if (groupTasks.length === 0) return null
            return (
              <section key={group}>
                <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${GROUP_STYLES[group]}`}>
                  {group} ({groupTasks.length})
                </h2>
                <div className="space-y-2">
                  {groupTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
