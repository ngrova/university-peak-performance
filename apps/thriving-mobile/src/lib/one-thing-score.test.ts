import { describe, it, expect } from 'vitest';
import { rankTasks } from './one-thing-score';
import type { TaskWithContext } from '@upp/db';

// Helper to create a minimal TaskWithContext
function task(overrides: Partial<TaskWithContext> = {}): TaskWithContext {
  return {
    id: 'id-1', user_id: 'u1', goal_id: 'g1', parent_task_id: null,
    title: 'Test task', notes: null, due_date: null, priority: 3,
    status: 'todo', is_one_thing: false, sort_order: 0,
    assignee: null, failure_cost: null,
    created_at: '2026-03-01T00:00:00Z', completed_at: null, updated_at: '2026-03-01T00:00:00Z',
    goals: { title: 'Goal', pillar_id: 'p1', priority_rank: 1, life_pillars: { id: 'p1', name: 'Health', color: '#5DCAA5', icon: '💪' } },
    ...overrides,
  } as TaskWithContext;
}

describe('rankTasks', () => {
  it('filters out completed and blocked tasks', () => {
    const result = rankTasks([task({ status: 'done' }), task({ status: 'blocked' })]);
    expect(result).toHaveLength(0);
  });

  it('scores P1 higher than P2 at same deadline', () => {
    const p1 = task({ id: 'p1', priority: 1 });
    const p2 = task({ id: 'p2', priority: 2 });
    const result = rankTasks([p2, p1]);
    expect(result[0]?.task.id).toBe('p1');
  });

  it('scores overdue task higher than upcoming task', () => {
    const overdue = task({ id: 'od', priority: 4, due_date: '2020-01-01' });
    const upcoming = task({ id: 'up', priority: 4, due_date: '2030-01-01' });
    const result = rankTasks([upcoming, overdue]);
    expect(result[0]?.task.id).toBe('od');
  });

  it('breaks ties by creation date (oldest first)', () => {
    const older = task({ id: 'old', priority: 3, created_at: '2026-01-01T00:00:00Z' });
    const newer = task({ id: 'new', priority: 3, created_at: '2026-03-01T00:00:00Z' });
    const result = rankTasks([newer, older]);
    expect(result[0]?.task.id).toBe('old');
  });

  it('returns score breakdown with priority and deadline weights', () => {
    const t = task({ priority: 1, due_date: '2020-01-01' });
    const result = rankTasks([t]);
    expect(result[0]?.priorityWeight).toBe(40);
    expect(result[0]?.deadlineWeight).toBe(50);
    expect(result[0]?.score).toBe(90);
  });
});
