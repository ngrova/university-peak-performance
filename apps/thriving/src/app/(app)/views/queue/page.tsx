import React, { Suspense } from 'react'
import { cookies } from 'next/headers'
import { createServerClient, getTasksForQueue } from '@upp/db'
import type { TaskWithContext } from '@upp/db'
import FailureCostBadge from '@/components/ui/FailureCostBadge'
import QueueFilters from './QueueFilters'

interface QueuePageProps {
  searchParams: Promise<{ assignee?: string }>
}

const STATUS_STYLES: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  blocked: 'bg-red-100 text-red-700',
}
const STATUS_LABEL: Record<string, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
}

function TaskRow({ task }: { task: TaskWithContext }): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 rounded-lg border bg-white">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
        <p className="text-xs text-gray-500">{task.goals?.title ?? 'Unsorted'}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <FailureCostBadge cost={task.failure_cost} />
        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[task.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABEL[task.status] ?? task.status}
        </span>
      </div>
    </div>
  )
}

function AssigneeGroup({ assignee, tasks }: { assignee: string; tasks: TaskWithContext[] }): React.JSX.Element {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
        👤 {assignee} ({tasks.length})
      </h2>
      <div className="space-y-2">
        {tasks.map((task) => <TaskRow key={task.id} task={task} />)}
      </div>
    </section>
  )
}

export default async function QueuePage({ searchParams }: QueuePageProps): Promise<React.JSX.Element> {
  const { assignee } = await searchParams
  const cookieStore = await cookies()
  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })
  const { data: { user } } = await supabase.auth.getUser()
  const tasks = user ? await getTasksForQueue(supabase, user.id, assignee) : []
  const showGroups = !assignee
  const grouped = showGroups
    ? tasks.reduce<Record<string, TaskWithContext[]>>((acc, task) => {
        const key = task.assignee ?? 'Unassigned'
        acc[key] = [...(acc[key] ?? []), task]
        return acc
      }, {})
    : {}

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">📋 Queue</h1>
      <Suspense>
        <QueueFilters />
      </Suspense>
      {tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">Nothing in the queue.</p>
          <p>All tasks are done or no tasks have been assigned.</p>
        </div>
      ) : showGroups ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([name, groupTasks]) => (
            <AssigneeGroup key={name} assignee={name} tasks={groupTasks} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => <TaskRow key={task.id} task={task} />)}
        </div>
      )}
    </div>
  )
}
