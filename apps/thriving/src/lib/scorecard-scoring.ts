import type { DomainKey, DomainScores, DomainAverages } from '@upp/db'
import { DOMAINS } from './scorecard-constants'

export function computeQ2Score(sliderValue: number, multiplier: number): number {
  const raw = sliderValue * multiplier
  return Math.min(10, Math.max(0, raw))
}

export function computeDomainAverage(q1: number, q2: number): number {
  return Math.round(((q1 + q2) / 2) * 10) / 10
}

export function computeOverallScore(domainAverages: DomainAverages): number {
  const keys = Object.keys(domainAverages) as DomainKey[]
  const total = keys.reduce((sum, key) => sum + domainAverages[key], 0)
  return Math.round((total / keys.length) * 100) / 100
}

export function buildDomainAverages(scores: DomainScores): DomainAverages {
  const result = {} as DomainAverages
  for (const domain of DOMAINS) {
    const [q1, q2] = scores[domain.key]
    result[domain.key] = computeDomainAverage(q1, q2)
  }
  return result
}
