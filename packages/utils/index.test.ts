import { describe, it, expect } from 'vitest';
import { selectOneThing } from './index';
import type { Task } from './index';

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    title: 'Default Task',
    status: 'todo',
    priority: 3,
    is_one_thing: false,
    due_date: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('selectOneThing', () => {
  it('returns null when task list is empty', () => {
    expect(selectOneThing([])).toBeNull();
  });

  it('returns null when all tasks are done', () => {
    const tasks = [
      makeTask({ id: '1', status: 'done' }),
      makeTask({ id: '2', status: 'done' }),
    ];
    expect(selectOneThing(tasks)).toBeNull();
  });

  it('manual override wins over everything', () => {
    const tasks = [
      makeTask({ id: '1', priority: 1, is_one_thing: false }),
      makeTask({ id: '2', priority: 4, is_one_thing: true }),
    ];
    expect(selectOneThing(tasks)?.id).toBe('2');
  });

  it('selects highest priority (lowest number) when no override', () => {
    const tasks = [
      makeTask({ id: '1', priority: 3 }),
      makeTask({ id: '2', priority: 1 }),
      makeTask({ id: '3', priority: 2 }),
    ];
    expect(selectOneThing(tasks)?.id).toBe('2');
  });

  it('uses due date as tiebreaker when priorities equal', () => {
    const tasks = [
      makeTask({ id: '1', priority: 2, due_date: '2026-06-01' }),
      makeTask({ id: '2', priority: 2, due_date: '2026-03-01' }),
      makeTask({ id: '3', priority: 2, due_date: '2026-09-01' }),
    ];
    expect(selectOneThing(tasks)?.id).toBe('2');
  });

  it('tasks with due dates rank before tasks without', () => {
    const tasks = [
      makeTask({ id: '1', priority: 2, due_date: null }),
      makeTask({ id: '2', priority: 2, due_date: '2026-12-31' }),
    ];
    expect(selectOneThing(tasks)?.id).toBe('2');
  });

  it('uses recency as final tiebreaker (most recently created wins)', () => {
    const tasks = [
      makeTask({ id: '1', priority: 2, due_date: null, created_at: '2026-01-01T00:00:00Z' }),
      makeTask({ id: '2', priority: 2, due_date: null, created_at: '2026-03-01T00:00:00Z' }),
    ];
    expect(selectOneThing(tasks)?.id).toBe('2');
  });

  it('skips done tasks when selecting', () => {
    const tasks = [
      makeTask({ id: '1', priority: 1, status: 'done' }),
      makeTask({ id: '2', priority: 2, status: 'todo' }),
    ];
    expect(selectOneThing(tasks)?.id).toBe('2');
  });
});
