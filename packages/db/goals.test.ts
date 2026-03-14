import { describe, it, expect, vi } from 'vitest'
import { getGoals, createGoal } from './goals'
import type { Goal } from './types'

const mockGoal: Goal = {
  id: 'goal-1',
  user_id: 'user-1',
  pillar_id: 'pillar-1',
  title: 'Run a marathon',
  description: null,
  target_date: null,
  status: 'active',
  sort_order: 1,
  color: '#6366f1',
  priority_rank: 5,
  created_at: '2026-03-13T00:00:00Z',
  updated_at: '2026-03-13T00:00:00Z',
}

describe('getGoals', () => {
  it('filters by pillar_id and returns active goals', async () => {
    const order = vi.fn().mockResolvedValue({ data: [mockGoal], error: null })
    const eqStatus = vi.fn().mockReturnValue({ order })
    const eqPillar = vi.fn().mockReturnValue({ eq: eqStatus })
    const select = vi.fn().mockReturnValue({ eq: eqPillar })
    const client = { from: vi.fn().mockReturnValue({ select }) }

    const result = await getGoals(client as never, 'pillar-1')
    expect(result).toEqual([mockGoal])
    expect(eqPillar).toHaveBeenCalledWith('pillar_id', 'pillar-1')
    expect(eqStatus).toHaveBeenCalledWith('status', 'active')
  })

  it('throws when supabase returns an error', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: new Error('db error') })
    const eqStatus = vi.fn().mockReturnValue({ order })
    const eqPillar = vi.fn().mockReturnValue({ eq: eqStatus })
    const select = vi.fn().mockReturnValue({ eq: eqPillar })
    const client = { from: vi.fn().mockReturnValue({ select }) }

    await expect(getGoals(client as never, 'pillar-1')).rejects.toThrow('db error')
  })
})

describe('createGoal', () => {
  it('inserts with user_id and returns the new goal', async () => {
    const single = vi.fn().mockResolvedValue({ data: mockGoal, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    const client = { from: vi.fn().mockReturnValue({ insert }) }

    const input = { pillar_id: 'pillar-1', title: 'Run a marathon', sort_order: 1 }
    const result = await createGoal(client as never, 'user-1', input)
    expect(result).toEqual(mockGoal)
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1' }))
  })
})
