import type { DomainKey, DomainScores, DomainAverages } from '@upp/db'

export interface ScoreResult {
  scores: DomainScores
  domainAverages: DomainAverages
  overallScore: number
}

// Each domain score = slider value directly (1.0–10.0)
export function computeScores(values: Record<string, number>): ScoreResult {
  const scores = {} as DomainScores
  const domainAverages = {} as DomainAverages

  for (const [key, value] of Object.entries(values)) {
    const rounded = Math.round(value * 10) / 10
    // DomainScores requires [number, number] tuple — store value twice for compatibility
    scores[key as DomainKey] = [rounded, rounded]
    domainAverages[key as DomainKey] = rounded
  }

  const vals = Object.values(domainAverages)
  const overallScore =
    Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100

  return { scores, domainAverages, overallScore }
}
