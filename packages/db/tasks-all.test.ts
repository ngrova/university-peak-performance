import { describe, it, expect, vi } from 'vitest'
import { getAllTasksWithContext } from './tasks-all'

// Minimal mock Supabase client
function mockClient(data: Record<string, unknown>[], error: unknown = null) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data, error }),
          }),
        }),
      }),
    }),
  } as never
}

describe('getAllTasksWithContext', () => {
  it('handles goals as object (PostgREST many-to-one shape)', async () => {
    const data = [{
      id: 't1', user_id: 'u1', goal_id: 'g1', title: 'Test',
      goals: { title: 'My Goal', pillar_id: 'p1', priority_rank: 1, life_pillars: { id: 'p1', name: 'Health', color: '#fff', icon: '💪' } },
    }]
    const result = await getAllTasksWithContext(mockClient(data), 'u1')
    expect(result[0]?.goals?.title).toBe('My Goal')
    expect(result[0]?.goals?.life_pillars?.name).toBe('Health')
  })

  it('handles goals as array (legacy shape)', async () => {
    const data = [{
      id: 't1', user_id: 'u1', goal_id: 'g1', title: 'Test',
      goals: [{ title: 'Array Goal', pillar_id: 'p1', priority_rank: 1, life_pillars: [{ id: 'p1', name: 'Career', color: '#000', icon: '💼' }] }],
    }]
    const result = await getAllTasksWithContext(mockClient(data), 'u1')
    expect(result[0]?.goals?.title).toBe('Array Goal')
    expect(result[0]?.goals?.life_pillars?.name).toBe('Career')
  })

  it('handles null goals gracefully', async () => {
    const data = [{ id: 't1', user_id: 'u1', goal_id: null, title: 'No goal', goals: null }]
    const result = await getAllTasksWithContext(mockClient(data), 'u1')
    expect(result[0]?.goals?.title).toBeUndefined()
  })

  it('throws on Supabase error', async () => {
    const client = mockClient([], new Error('DB error'))
    await expect(getAllTasksWithContext(client, 'u1')).rejects.toThrow('DB error')
  })
})
