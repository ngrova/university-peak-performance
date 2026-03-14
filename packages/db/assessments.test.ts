import { describe, it, expect, vi } from 'vitest'
import { saveAssessment, getAssessmentHistory, getLatestAssessment } from './assessments'
import type { Assessment, DomainScores, DomainAverages } from './assessments'

const mockScores: DomainScores = {
  physical: [7, 8.6], mental: [4.5, 5.7], spiritual: [9, 7],
  purpose: [7, 6], character: [4.5, 5], relationships: [9, 8],
  social: [7, 6], financial: [4, 5], growth: [9, 8],
  adventure: [7, 6], environment: [4.5, 5],
}

const mockAverages: DomainAverages = {
  physical: 7.8, mental: 5.1, spiritual: 8.0, purpose: 6.5,
  character: 4.8, relationships: 8.5, social: 6.5, financial: 4.5,
  growth: 8.5, adventure: 6.5, environment: 4.8,
}

const mockAssessment: Assessment = {
  id: 'assess-1',
  user_id: 'user-1',
  scores: mockScores,
  domain_averages: mockAverages,
  overall_score: 6.55,
  created_at: '2026-03-14T00:00:00Z',
}

describe('saveAssessment', () => {
  it('inserts and returns the assessment', async () => {
    const single = vi.fn().mockResolvedValue({ data: mockAssessment, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    const client = { from: vi.fn().mockReturnValue({ insert }) }

    const result = await saveAssessment(client as never, 'user-1', mockScores, mockAverages, 6.55)
    expect(result).toEqual(mockAssessment)
    expect(client.from).toHaveBeenCalledWith('assessments')
  })

  it('throws when supabase returns an error', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: new Error('db error') })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    const client = { from: vi.fn().mockReturnValue({ insert }) }

    await expect(saveAssessment(client as never, 'user-1', mockScores, mockAverages, 6.55))
      .rejects.toThrow('db error')
  })
})

describe('getAssessmentHistory', () => {
  it('returns assessments ordered by created_at desc', async () => {
    const order = vi.fn().mockResolvedValue({ data: [mockAssessment], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    const client = { from: vi.fn().mockReturnValue({ select }) }

    const result = await getAssessmentHistory(client as never, 'user-1')
    expect(result).toEqual([mockAssessment])
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('returns empty array when no assessments', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    const client = { from: vi.fn().mockReturnValue({ select }) }

    const result = await getAssessmentHistory(client as never, 'user-1')
    expect(result).toEqual([])
  })
})

describe('getLatestAssessment', () => {
  it('returns the most recent assessment', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: mockAssessment, error: null })
    const limit = vi.fn().mockReturnValue({ maybeSingle })
    const order = vi.fn().mockReturnValue({ limit })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    const client = { from: vi.fn().mockReturnValue({ select }) }

    const result = await getLatestAssessment(client as never, 'user-1')
    expect(result).toEqual(mockAssessment)
  })

  it('returns null when no assessments exist', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const limit = vi.fn().mockReturnValue({ maybeSingle })
    const order = vi.fn().mockReturnValue({ limit })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    const client = { from: vi.fn().mockReturnValue({ select }) }

    const result = await getLatestAssessment(client as never, 'user-1')
    expect(result).toBeNull()
  })
})
