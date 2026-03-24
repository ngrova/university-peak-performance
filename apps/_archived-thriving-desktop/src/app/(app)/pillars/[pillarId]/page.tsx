import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServerClient, getPillars, getGoals } from '@upp/db'
import GoalCard from '@/components/goals/GoalCard'
import AddGoalButton from '@/components/goals/AddGoalButton'

interface PillarPageProps {
  params: Promise<{ pillarId: string }>
}

// Server Component — user validated by AppLayout
export default async function PillarPage({ params }: PillarPageProps): Promise<React.JSX.Element> {
  const { pillarId } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [pillars, goals] = await Promise.all([
    getPillars(supabase, user.id),
    getGoals(supabase, pillarId),
  ])

  const pillar = pillars.find((p) => p.id === pillarId)
  if (!pillar) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800">
          ← Back to Dashboard
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{pillar.icon}</span>
          <h1
            className="text-2xl font-bold"
            style={{ color: pillar.color }}
          >
            {pillar.name}
          </h1>
        </div>
        <AddGoalButton pillarId={pillarId} />
      </div>
      {goals.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No goals yet.</p>
          <p>Add your first goal for this pillar.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} pillarId={pillarId} />
          ))}
        </div>
      )}
    </div>
  )
}
