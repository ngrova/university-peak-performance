'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@upp/db'
import type { Assessment } from '@upp/db'
import { getLatestAssessment } from '@upp/db'
import { DOMAINS } from '@/lib/scorecard-constants'
import RadarChart from './RadarChart'

export default function ResultsPage(): React.JSX.Element {
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const a = await getLatestAssessment(supabase, user.id)
      if (!a) { router.push('/scorecard'); return }
      setAssessment(a)
      setLoading(false)
    }
    void load()
  }, [router])

  if (loading || !assessment) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">Loading results…</div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Thrive Score</h1>
        <div className="text-6xl font-black text-amber-600">
          {assessment.overall_score.toFixed(1)}
          <span className="text-2xl font-normal text-gray-400">/10</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <RadarChart domainAverages={assessment.domain_averages} />
      </div>

      <DomainScoreList assessment={assessment} />

      <div className="flex gap-3 justify-center pb-8">
        <Link
          href="/scorecard"
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View History
        </Link>
        <Link
          href="/scorecard/assessment"
          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          Retake Assessment
        </Link>
      </div>
    </div>
  )
}

function DomainScoreList({ assessment }: { assessment: Assessment }): React.JSX.Element {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
      {DOMAINS.map((d) => {
        const avg = assessment.domain_averages[d.key] ?? 0
        const pct = (avg / 10) * 100
        return (
          <div key={d.key} className="flex items-center gap-3 px-5 py-3">
            <span className="text-xl w-7 shrink-0">{d.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-800 truncate">{d.name}</span>
                <span className="font-bold text-amber-600 ml-2 shrink-0">{avg.toFixed(1)}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: d.color }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
