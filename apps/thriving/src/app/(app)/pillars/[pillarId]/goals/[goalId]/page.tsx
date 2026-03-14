import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServerClient, getPillars, getGoals, getTasksByGoal } from '@upp/db'
import TaskCard from '@/components/tasks/TaskCard'
import AddTaskButton from '@/components/tasks/AddTaskButton'

interface GoalPageProps {
  params: Promise<{ pillarId: string; goalId: string }>
}

export default async function GoalPage({ params }: GoalPageProps): Promise<React.JSX.Element> {
  const { pillarId, goalId } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [goals, tasks] = await Promise.all([
    getGoals(supabase, pillarId),
    getTasksByGoal(supabase, goalId),
  ])

  const goal = goals.find((g) => g.id === goalId)
  if (!goal) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href={`/pillars/${pillarId}`} className="text-sm text-indigo-600 hover:text-indigo-800">
          ← Back to Pillar
        </Link>
      </div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{goal.title}</h1>
          {goal.description && (
            <p className="text-gray-600 mt-1 text-sm">{goal.description}</p>
          )}
        </div>
        <AddTaskButton goalId={goalId} pillarId={pillarId} />
      </div>
      {tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No tasks yet.</p>
          <p>Add your first task for this goal.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} goalId={goalId} pillarId={pillarId} />
          ))}
        </div>
      )}
    </div>
  )
}
