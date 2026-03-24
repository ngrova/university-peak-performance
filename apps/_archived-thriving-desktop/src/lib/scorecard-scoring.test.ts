import { describe, it, expect } from 'vitest'
import { computeScores } from './scorecard-scoring'
import { DOMAINS } from './scorecard-constants'

describe('computeScores', () => {
  it('returns rounded domain averages matching the input values', () => {
    const values: Record<string, number> = {}
    for (const d of DOMAINS) values[d.key] = 5.0

    const { scores, domainAverages, overallScore } = computeScores(values)

    for (const d of DOMAINS) {
      expect(domainAverages[d.key]).toBe(5.0)
      expect(scores[d.key]).toEqual([5.0, 5.0])
    }
    expect(overallScore).toBe(5.0)
  })

  it('rounds values to 1 decimal place', () => {
    const values: Record<string, number> = {}
    for (const d of DOMAINS) values[d.key] = 5.0
    values['physical'] = 7.25

    const { domainAverages } = computeScores(values)
    expect(domainAverages['physical']).toBe(7.3)
  })

  it('computes correct overall average', () => {
    const values: Record<string, number> = {}
    for (const d of DOMAINS) values[d.key] = 8.0
    values['physical'] = 2.0

    const { overallScore } = computeScores(values)
    // 10 domains at 8.0 + 1 domain at 2.0 = 82 / 11 ≈ 7.45
    expect(overallScore).toBeCloseTo(82 / 11, 1)
  })

  it('stores DomainScores as [value, value] tuple', () => {
    const values = { physical: 6.5 }
    const { scores } = computeScores(values)
    expect(scores['physical']).toEqual([6.5, 6.5])
  })
})
