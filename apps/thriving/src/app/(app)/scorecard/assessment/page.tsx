'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient, saveAssessment } from '@upp/db'
import type { DomainScores } from '@upp/db'
import { DOMAINS, SCENARIO_QUESTIONS, SLIDER_QUESTIONS, TOTAL_STEPS } from '@/lib/scorecard-constants'
import type { Domain } from '@/lib/scorecard-constants'
import { buildDomainAverages, computeOverallScore, computeQ2Score } from '@/lib/scorecard-scoring'
import ScenarioStep from './ScenarioStep'
import SliderStep from './SliderStep'

// Step layout: for each domain, Q1 (scenario) then Q2 (slider)
export default function AssessmentPage(): React.JSX.Element {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [scenarioAnswers, setScenarioAnswers] = useState<(number | null)[]>(Array(11).fill(null))
  const [sliderAnswers, setSliderAnswers] = useState<number[]>(
    SLIDER_QUESTIONS.map((q) => Math.round((q.min + q.max) / 2))
  )
  const [saving, setSaving] = useState(false)

  const domainIdx = Math.floor(step / 2)
  const isScenario = step % 2 === 0
  // domainIdx is always in bounds: step 0..21 → domainIdx 0..10
  const domain: Domain = DOMAINS[domainIdx] as Domain

  async function handleFinish() {
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const scores = {} as DomainScores
      for (let i = 0; i < DOMAINS.length; i++) {
        const d = DOMAINS[i]
        const sq = SLIDER_QUESTIONS[i]
        if (!d || !sq) continue
        const q1 = scenarioAnswers[i] ?? 0
        const q2 = computeQ2Score(sliderAnswers[i] ?? sq.min, sq.multiplier)
        scores[d.key] = [q1, q2]
      }
      const domainAverages = buildDomainAverages(scores)
      const overall = computeOverallScore(domainAverages)
      await saveAssessment(supabase, user.id, scores, domainAverages, overall)
      router.push('/scorecard/results')
    } finally {
      setSaving(false)
    }
  }

  function handleNext() {
    if (step === TOTAL_STEPS - 1) { void handleFinish(); return }
    setStep((s) => s + 1)
  }

  const currentScenarioAnswer = scenarioAnswers[domainIdx] ?? null
  const canProceed = isScenario ? currentScenarioAnswer !== null : true
  const scenarioQ = SCENARIO_QUESTIONS[domainIdx]
  const sliderQ = SLIDER_QUESTIONS[domainIdx]

  return (
    <div className="max-w-xl mx-auto">
      <ProgressDots step={step} />
      <div className="rounded-2xl p-6 mt-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <DomainHeader domain={domain} />
        {isScenario && scenarioQ ? (
          <ScenarioStep
            question={scenarioQ}
            selected={currentScenarioAnswer}
            onSelect={(score) => {
              const next = [...scenarioAnswers]
              next[domainIdx] = score
              setScenarioAnswers(next)
            }}
          />
        ) : sliderQ ? (
          <SliderStep
            question={sliderQ}
            value={sliderAnswers[domainIdx] ?? sliderQ.min}
            onChange={(v) => {
              const next = [...sliderAnswers]
              next[domainIdx] = v
              setSliderAnswers(next)
            }}
          />
        ) : null}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-sm rounded-xl border disabled:opacity-30 transition-colors hover:bg-black/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed || saving}
            className="px-6 py-2 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
          >
            {step === TOTAL_STEPS - 1 ? (saving ? 'Saving…' : 'Finish') : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProgressDots({ step }: { step: number }): React.JSX.Element {
  return (
    <div className="flex gap-1 flex-wrap justify-center">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={[
            'w-2.5 h-2.5 rounded-full transition-colors',
            i < step ? 'bg-amber-500' : i === step ? 'bg-amber-600 ring-2 ring-amber-300' : 'bg-gray-200',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

function DomainHeader({ domain }: { domain: Domain }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-3xl">{domain.icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>{domain.category}</p>
        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{domain.name}</p>
      </div>
    </div>
  )
}
