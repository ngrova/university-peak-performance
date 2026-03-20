import { describe, it, expect, vi } from 'vitest'
import { getPillars, createPillar, deletePillar, getPillarsWithProgress } from './pillars'
import type { LifePillar } from './types'

const mockPillar: LifePillar = {
  id: 'pillar-1',
  user_id: 'user-1',
  name: 'Health & Fitness',
  icon: '🏋️',
  color: '#ef4444',
  sort_order: 1,
  is_archived: false,
  created_at: '2026-03-13T00:00:00Z',
  updated_at: '2026-03-13T00:00:00Z',
}

function makeClient(data: unknown, error: unknown = null) {
  const single = vi.fn().mockResolvedValue({ data, error })
  const select = vi.fn().mockReturnValue({ single })
  const limit = vi.fn().mockResolvedValue({ data, error })
  const order = vi.fn().mockReturnValue({ limit })
  const eqArchived = vi.fn().mockReturnValue({ order })
  const eqUser = vi.fn().mockReturnValue({ eq: eqArchived })
  const selectAll = vi.fn().mockReturnValue({ eq: eqUser })
  const insert = vi.fn().mockReturnValue({ select })
  const del = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error }) })
  return { from: vi.fn().mockReturnValue({ select: selectAll, insert, delete: del }) }
}

describe('getPillars', () => {
  it('returns ordered pillars for a user', async () => {
    const pillars = [mockPillar]
    const client = makeClient(pillars)
    const result = await getPillars(client as never, 'user-1')
    expect(result).toEqual(pillars)
    expect(client.from).toHaveBeenCalledWith('life_pillars')
  })

  it('throws when supabase returns an error', async () => {
    const client = makeClient(null, new Error('db error'))
    await expect(getPillars(client as never, 'user-1')).rejects.toThrow('db error')
  })
})

describe('createPillar', () => {
  it('inserts and returns a new pillar', async () => {
    const insertClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockPillar, error: null }),
          }),
        }),
      }),
    }
    const input = { name: 'Health & Fitness', icon: '🏋️', color: '#ef4444', sort_order: 1 }
    const result = await createPillar(insertClient as never, 'user-1', input)
    expect(result).toEqual(mockPillar)
    expect(insertClient.from).toHaveBeenCalledWith('life_pillars')
  })
})

describe('deletePillar', () => {
  it('calls delete with the correct id', async () => {
    const eqFn = vi.fn().mockResolvedValue({ error: null })
    const deleteClient = {
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({ eq: eqFn }),
      }),
    }
    await deletePillar(deleteClient as never, 'pillar-1')
    expect(eqFn).toHaveBeenCalledWith('id', 'pillar-1')
  })
})

describe('getPillarsWithProgress', () => {
  function makeProgressClient(
    pillars: LifePillar[],
    goals: { id: string; pillar_id: string }[],
    tasks: { goal_id: string; status: string }[],
  ) {
    return {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'life_pillars') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: pillars, error: null }),
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'goals') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: goals, error: null }),
                }),
              }),
            }),
          }
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: tasks, error: null }),
            }),
          }),
        }
      }),
    }
  }

  it('returns pillars with zero counts when no goals exist', async () => {
    const client = makeProgressClient([mockPillar], [], [])
    const result = await getPillarsWithProgress(client as never, 'user-1')
    expect(result).toHaveLength(1)
    expect(result[0]!.goalCount).toBe(0)
    expect(result[0]!.taskCount).toBe(0)
    expect(result[0]!.completedTaskCount).toBe(0)
  })

  it('returns correct counts when goals and tasks exist', async () => {
    const goals = [
      { id: 'g1', pillar_id: 'pillar-1' },
      { id: 'g2', pillar_id: 'pillar-1' },
    ]
    const tasks = [
      { goal_id: 'g1', status: 'done' },
      { goal_id: 'g1', status: 'todo' },
      { goal_id: 'g2', status: 'done' },
    ]
    const client = makeProgressClient([mockPillar], goals, tasks)
    const result = await getPillarsWithProgress(client as never, 'user-1')
    expect(result[0]!.goalCount).toBe(2)
    expect(result[0]!.taskCount).toBe(3)
    expect(result[0]!.completedTaskCount).toBe(2)
  })

  it('returns empty array when user has no pillars', async () => {
    const client = makeProgressClient([], [], [])
    const result = await getPillarsWithProgress(client as never, 'user-1')
    expect(result).toEqual([])
  })

  it('throws when goals query errors', async () => {
    const client = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'life_pillars') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [mockPillar], error: null }),
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'goals') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: null, error: new Error('goals error') }),
                }),
              }),
            }),
          }
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }
      }),
    }
    await expect(getPillarsWithProgress(client as never, 'user-1')).rejects.toThrow('goals error')
  })
})
