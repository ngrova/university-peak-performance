'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient, saveAssessment } from '@upp/db'
import { DOMAINS } from '@/lib/scorecard-constants'
import { computeScores } from '@/lib/scorecard-scoring'
import AnchoredSlider from './AnchoredSlider'
import ProgressHeader from './ProgressHeader'
import QuickJump from './QuickJump'

const initialValues = (): Record<string, number> =>
  Object.fromEntries(DOMAINS.map((d) => [d.key, 5.0]))

export default function AssessmentPage(): React.JSX.Element {
  const router = useRouter()
  const [currentDomain, setCurrentDomain] = useState(0)
  const [values, setValues] = useState<Record<string, number>>(initialValues)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const domain = DOMAINS[currentDomain]!

  function handleChange(v: number) {
    setValues((prev) => ({ ...prev, [domain.key]: v }))
    setCompleted((prev) => new Set(prev).add(domain.key))
  }

  function handleBack() {
    setCurrentDomain((i) => Math.max(0, i - 1))
  }

  function handleNext() {
    if (currentDomain < DOMAINS.length - 1) {
      setCompleted((prev) => new Set(prev).add(domain.key))
      setCurrentDomain((i) => i + 1)
    } else {
      void handleSubmit()
    }
  }

  async function handleSubmit() {
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { scores, domainAverages, overallScore } = computeScores(values)
      await saveAssessment(supabase, user.id, scores, domainAverages, overallScore)
      router.push('/scorecard/results')
    } finally {
      setSaving(false)
    }
  }

  const isLast = currentDomain === DOMAINS.length - 1

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <ProgressHeader currentDomain={currentDomain} completed={completed} />

      <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        {/* Domain header */}
        <div className="flex items-center gap-3 mb-2">
          <span style={{ fontSize: '48px', lineHeight: 1 }}>{domain.icon}</span>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: domain.color }}>{domain.category}</p>
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-fraunces)', color: 'var(--text-primary)' }}>{domain.name}</p>
          </div>
        </div>

        <p className="mb-5 italic" style={{ fontFamily: 'var(--font-fraunces)', fontSize: '20px', color: 'var(--text-secondary)' }}>
          Where are you right now?
        </p>

        <AnchoredSlider domain={domain} value={values[domain.key] ?? 5.0} onChange={handleChange} />
      </div>

      <QuickJump currentDomain={currentDomain} completed={completed} onJump={setCurrentDomain} />

      {/* Nav */}
      <div className="flex justify-between pb-4">
        <button
          onClick={handleBack} disabled={currentDomain === 0}
          className="px-4 py-2 text-sm rounded-xl border disabled:opacity-30 transition-colors hover:bg-black/5"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext} disabled={saving}
          className="px-6 py-2 text-white font-semibold rounded-xl transition-colors disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {isLast ? (saving ? 'Saving…' : 'See Results') : 'Next →'}
        </button>
      </div>
    </div>
  )
}
