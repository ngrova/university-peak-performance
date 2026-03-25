import { describe, it, expect, vi } from 'vitest'
import { getOneThingTask, getTasksWithDeadlines, getTasksForQueue } from './tasks-views'
import type { TaskWithContext } from './tasks-views'

const makeTask = (overrides: Partial<TaskWithContext> = {}): TaskWithContext => ({
  id: 'task-1',
  user_id: 'user-1',
  goal_id: 'goal-1',
  parent_task_id: null,
  title: 'Test task',
  notes: null,
  due_date: null,
  priority: 2,
  status: 'todo',
  is_one_thing: false,
  sort_order: 0,
  assignee: null,
  failure_cost: 'low',
  created_at: '2026-01-01T00:00:00Z',
  completed_at: null,
  updated_at: '2026-01-01T00:00:00Z',
  goals: {
    title: 'My Goal',
    pillar_id: 'p-1',
    priority_rank: 5,
    life_pillars: { id: 'p-1', name: 'Health', color: '#fff', icon: '💪' },
  },
  ...overrides,
})

// getOneThingTask chain: .from().select().eq(user).neq(status).limit() → resolved
function makeOneThingClient(tasks: TaskWithContext[], error?: Error) {
  const limitFn = vi.fn().mockResolvedValue({ data: error ? null : tasks, error: error ?? null })
  const neqFn = vi.fn().mockReturnValue({ limit: limitFn })
  const eqFn = vi.fn().mockReturnValue({ neq: neqFn })
  const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
  return { from: vi.fn().mockReturnValue({ select: selectFn }) }
}

describe('getOneThingTask', () => {
  it('returns pinned is_one_thing task first', async () => {
    const pinned = makeTask({ id: 'pinned', is_one_thing: true, failure_cost: 'low', priority: 4 })
    const critical = makeTask({ id: 'crit', failure_cost: 'critical', priority: 1 })
    const client = makeOneThingClient([critical, pinned])

    const result = await getOneThingTask(client as never, 'user-1')
    expect(result?.id).toBe('pinned')
  })

  it('returns highest failure_cost task when no pinned task', async () => {
    const low = makeTask({ id: 'low', failure_cost: 'low', priority: 1 })
    const critical = makeTask({ id: 'crit', failure_cost: 'critical', priority: 3 })
    const client = makeOneThingClient([low, critical])

    const result = await getOneThingTask(client as never, 'user-1')
    expect(result?.id).toBe('crit')
  })

  it('returns null when no tasks', async () => {
    const client = makeOneThingClient([])
    const result = await getOneThingTask(client as never, 'user-1')
    expect(result).toBeNull()
  })

  it('throws on db error', async () => {
    const client = makeOneThingClient([], new Error('db error'))
    await expect(getOneThingTask(client as never, 'user-1')).rejects.toThrow('db error')
  })
})

// getTasksWithDeadlines: .from().select().eq(user).neq(status).not(due_date).order().limit() → resolved
function makeDeadlinesClient(tasks: TaskWithContext[], error?: Error) {
  const limitFn = vi.fn().mockResolvedValue({ data: error ? null : tasks, error: error ?? null })
  const orderFn = vi.fn().mockReturnValue({ limit: limitFn })
  const notFn = vi.fn().mockReturnValue({ order: orderFn })
  const neqFn = vi.fn().mockReturnValue({ not: notFn })
  const eqFn = vi.fn().mockReturnValue({ neq: neqFn })
  const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
  return { from: vi.fn().mockReturnValue({ select: selectFn }) }
}

describe('getTasksWithDeadlines', () => {
  it('returns tasks in due_date order', async () => {
    const t1 = makeTask({ id: 't1', due_date: '2026-03-20' })
    const t2 = makeTask({ id: 't2', due_date: '2026-03-15' })
    const client = makeDeadlinesClient([t2, t1])

    const result = await getTasksWithDeadlines(client as never, 'user-1')
    expect(result).toHaveLength(2)
    // DB returns in order; we just pass through
    expect(result[0]?.id).toBe('t2')
  })

  it('throws on db error', async () => {
    const client = makeDeadlinesClient([], new Error('fail'))
    await expect(getTasksWithDeadlines(client as never, 'user-1')).rejects.toThrow('fail')
  })
})

// getTasksForQueue: .from().select().eq(user).neq(status).limit() → resolved (no assignee)
// with assignee: .from().select().eq(user).neq(status).eq(assignee).limit() → resolved
function makeQueueClient(tasks: TaskWithContext[], withAssignee?: string) {
  if (withAssignee) {
    const limitFn = vi.fn().mockResolvedValue({ data: tasks, error: null })
    const eqAssigneeFn = vi.fn().mockReturnValue({ limit: limitFn })
    const neqFn = vi.fn().mockReturnValue({ eq: eqAssigneeFn })
    const eqUserFn = vi.fn().mockReturnValue({ neq: neqFn })
    const selectFn = vi.fn().mockReturnValue({ eq: eqUserFn })
    return { from: vi.fn().mockReturnValue({ select: selectFn }) }
  }
  const limitFn = vi.fn().mockResolvedValue({ data: tasks, error: null })
  const neqFn = vi.fn().mockReturnValue({ limit: limitFn })
  const eqFn = vi.fn().mockReturnValue({ neq: neqFn })
  const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
  return { from: vi.fn().mockReturnValue({ select: selectFn }) }
}

describe('getTasksForQueue', () => {
  it('sorts by failure_cost then priority', async () => {
    const highP2 = makeTask({ id: 'h2', failure_cost: 'high', priority: 2 })
    const critP3 = makeTask({ id: 'c3', failure_cost: 'critical', priority: 3 })
    const critP1 = makeTask({ id: 'c1', failure_cost: 'critical', priority: 1 })
    const client = makeQueueClient([highP2, critP3, critP1])

    const result = await getTasksForQueue(client as never, 'user-1')
    expect(result[0]?.id).toBe('c1')
    expect(result[1]?.id).toBe('c3')
    expect(result[2]?.id).toBe('h2')
  })

  it('filters by assignee when provided', async () => {
    const nickTask = makeTask({ id: 'n1', assignee: 'Nick' })
    const client = makeQueueClient([nickTask], 'Nick')

    const result = await getTasksForQueue(client as never, 'user-1', 'Nick')
    expect(result[0]?.assignee).toBe('Nick')
  })
})
