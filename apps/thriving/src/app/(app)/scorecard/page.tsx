import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient, getAssessmentHistory } from '@upp/db'
import type { Assessment } from '@upp/db'
import { DOMAINS } from '@/lib/scorecard-constants'

export default async function ScorecardPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies()
  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })

  const { data: { user } } = await supabase.auth.getUser()
  const history: Assessment[] = user ? await getAssessmentHistory(supabase, user.id) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🎯 Scorecard</h1>
        <Link
          href="/scorecard/assessment"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
        >
          Take Assessment
        </Link>
      </div>

      {history.length === 0 ? (
        <EmptyState />
      ) : (
        <HistoryList assessments={history} />
      )}
    </div>
  )
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">📊</p>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">No assessments yet</h2>
      <p className="text-gray-500 mb-6">
        Take your first Thrive Assessment to see how you&apos;re doing across 11 life domains.
      </p>
      <Link
        href="/scorecard/assessment"
        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
      >
        Start Assessment
      </Link>
    </div>
  )
}

function HistoryList({ assessments }: { assessments: Assessment[] }): React.JSX.Element {
  return (
    <div className="space-y-4">
      {assessments.map((a) => (
        <AssessmentCard key={a.id} assessment={a} />
      ))}
    </div>
  )
}

function AssessmentCard({ assessment }: { assessment: Assessment }): React.JSX.Element {
  const date = new Date(assessment.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{date}</span>
        <span className="text-2xl font-bold text-amber-600">
          {assessment.overall_score.toFixed(1)}
          <span className="text-sm font-normal text-gray-400">/10</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {DOMAINS.map((d) => {
          const score = assessment.domain_averages[d.key]
          return (
            <span key={d.key} className="flex items-center gap-1 text-xs bg-gray-50 rounded px-2 py-1">
              <span>{d.icon}</span>
              <span className="font-medium">{score?.toFixed(1) ?? '—'}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
