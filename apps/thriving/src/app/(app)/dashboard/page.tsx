import React from 'react'
import { cookies } from 'next/headers'
import { createServerClient, getPillarsWithProgress } from '@upp/db'
import PillarCard from '@/components/pillars/PillarCard'
import AddPillarButton from '@/components/pillars/AddPillarButton'

// Server Component — user is already validated by AppLayout
export default async function DashboardPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies()

  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })

  const { data: { user } } = await supabase.auth.getUser()
  const pillars = user ? await getPillarsWithProgress(supabase, user.id) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold italic"
          style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text-primary)' }}
        >
          My Life Pillars
        </h1>
        <AddPillarButton />
      </div>
      {pillars.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-light)' }}>
          <p className="text-lg mb-2">No pillars yet.</p>
          <p>Create your first one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.id} pillar={pillar} />
          ))}
        </div>
      )}
    </div>
  )
}
