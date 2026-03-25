import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskDetail } from './use-task-detail';
import type { TaskWithContext } from '@upp/db';

/** Minimal task fixture for store tests */
function makeTask(overrides?: Partial<TaskWithContext>): TaskWithContext {
  return {
    id: 'task-1',
    user_id: 'user-1',
    goal_id: null,
    parent_task_id: null,
    title: 'Test task',
    notes: null,
    due_date: null,
    priority: 2,
    status: 'todo',
    is_one_thing: false,
    sort_order: 0,
    assignee: 'Nick',
    failure_cost: null,
    created_at: '2026-01-01T00:00:00Z',
    completed_at: null,
    updated_at: '2026-01-01T00:00:00Z',
    goals: null,
    ...overrides,
  };
}

describe('useTaskDetail store', () => {
  beforeEach(() => {
    useTaskDetail.getState().close();
  });

  it('updateField patches a single field on the stored task', () => {
    const task = makeTask({ assignee: 'Nick' });
    useTaskDetail.getState().open(task);
    useTaskDetail.getState().updateField('assignee', 'Erin');
    expect(useTaskDetail.getState().task?.assignee).toBe('Erin');
  });

  it('updateField preserves all other fields', () => {
    const task = makeTask({ priority: 1, assignee: 'Nick' });
    useTaskDetail.getState().open(task);
    useTaskDetail.getState().updateField('assignee', 'Liz');
    const updated = useTaskDetail.getState().task;
    expect(updated?.priority).toBe(1);
    expect(updated?.title).toBe('Test task');
    expect(updated?.assignee).toBe('Liz');
  });

  it('updateField does nothing when no task is open', () => {
    useTaskDetail.getState().updateField('assignee', 'Erin');
    expect(useTaskDetail.getState().task).toBeNull();
  });

  it('updateField supports setting a field to null', () => {
    const task = makeTask({ assignee: 'Nick' });
    useTaskDetail.getState().open(task);
    useTaskDetail.getState().updateField('assignee', null);
    expect(useTaskDetail.getState().task?.assignee).toBeNull();
  });
});
