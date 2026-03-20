import { describe, it, expect, vi } from 'vitest'
import { getTasksByGoal, createTask, updateTask, deleteTask } from './tasks'
import type { Task } from './types'

const mockTask: Task = {
  id: 'task-1',
  user_id: 'user-1',
  goal_id: 'goal-1',
  parent_task_id: null,
  title: 'Write unit tests',
  notes: null,
  due_date: null,
  priority: 2,
  status: 'todo',
  is_one_thing: false,
  sort_order: 0,
  assignee: null,
  failure_cost: null,
  created_at: '2026-03-14T00:00:00Z',
  completed_at: null,
  updated_at: '2026-03-14T00:00:00Z',
}

describe('getTasksByGoal', () => {
  it('filters by goal_id and returns tasks in order', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [mockTask], error: null })
    const order = vi.fn().mockReturnValue({ limit })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    const client = { from: vi.fn().mockReturnValue({ select }) }

    const result = await getTasksByGoal(client as never, 'goal-1')
    expect(result).toEqual([mockTask])
    expect(eq).toHaveBeenCalledWith('goal_id', 'goal-1')
    expect(limit).toHaveBeenCalledWith(50)
  })

  it('throws when supabase returns an error', async () => {
    const limit = vi.fn().mockResolvedValue({ data: null, error: new Error('db error') })
    const order = vi.fn().mockReturnValue({ limit })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    const client = { from: vi.fn().mockReturnValue({ select }) }

    await expect(getTasksByGoal(client as never, 'goal-1')).rejects.toThrow('db error')
  })
})

describe('createTask', () => {
  it('inserts with user_id and status todo, returns the new task', async () => {
    const single = vi.fn().mockResolvedValue({ data: mockTask, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    const client = { from: vi.fn().mockReturnValue({ insert }) }

    const input = { goal_id: 'goal-1', title: 'Write unit tests', sort_order: 0 }
    const result = await createTask(client as never, 'user-1', input)
    expect(result).toEqual(mockTask)
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1', status: 'todo' }))
  })
})

describe('updateTask', () => {
  it('updates fields and returns updated task', async () => {
    const single = vi.fn().mockResolvedValue({ data: { ...mockTask, title: 'Updated' }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const eq = vi.fn().mockReturnValue({ select })
    const update = vi.fn().mockReturnValue({ eq })
    const client = { from: vi.fn().mockReturnValue({ update }) }

    const result = await updateTask(client as never, 'task-1', { title: 'Updated' })
    expect(result.title).toBe('Updated')
    expect(eq).toHaveBeenCalledWith('id', 'task-1')
  })
})

describe('deleteTask', () => {
  it('deletes by id without error', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const del = vi.fn().mockReturnValue({ eq })
    const client = { from: vi.fn().mockReturnValue({ delete: del }) }

    await expect(deleteTask(client as never, 'task-1')).resolves.toBeUndefined()
    expect(eq).toHaveBeenCalledWith('id', 'task-1')
  })

  it('throws when supabase returns an error', async () => {
    const eq = vi.fn().mockResolvedValue({ error: new Error('delete failed') })
    const del = vi.fn().mockReturnValue({ eq })
    const client = { from: vi.fn().mockReturnValue({ delete: del }) }

    await expect(deleteTask(client as never, 'task-1')).rejects.toThrow('delete failed')
  })
})

describe('createTask with assignee and failure_cost', () => {
  it('passes assignee and failure_cost to insert', async () => {
    const taskWithFields: Task = { ...mockTask, assignee: 'Nick', failure_cost: 'high' }
    const single = vi.fn().mockResolvedValue({ data: taskWithFields, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    const client = { from: vi.fn().mockReturnValue({ insert }) }

    const input = { goal_id: 'goal-1', title: 'Deploy fix', sort_order: 0, assignee: 'Nick' as const, failure_cost: 'high' as const }
    const result = await createTask(client as never, 'user-1', input)
    expect(result.assignee).toBe('Nick')
    expect(result.failure_cost).toBe('high')
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ assignee: 'Nick', failure_cost: 'high' }))
  })
})

describe('updateTask with assignee and failure_cost', () => {
  it('updates assignee and failure_cost', async () => {
    const updated: Task = { ...mockTask, assignee: 'Erin', failure_cost: 'critical' }
    const single = vi.fn().mockResolvedValue({ data: updated, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const eq = vi.fn().mockReturnValue({ select })
    const update = vi.fn().mockReturnValue({ eq })
    const client = { from: vi.fn().mockReturnValue({ update }) }

    const result = await updateTask(client as never, 'task-1', { assignee: 'Erin', failure_cost: 'critical' })
    expect(result.assignee).toBe('Erin')
    expect(result.failure_cost).toBe('critical')
  })
})
