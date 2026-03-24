import { describe, it, expect } from 'vitest';
import { buildWhyThis } from './why-this';
import type { ScoredTask } from './one-thing-score';
import type { TaskWithContext } from '@upp/db';

// Helper to create a minimal ScoredTask
function scored(overrides: Partial<TaskWithContext> = {}, score = 50): ScoredTask {
  const task = {
    id: 'id-1', user_id: 'u1', goal_id: 'g1', parent_task_id: null,
    title: 'Test', notes: null, due_date: null, priority: 3,
    status: 'todo', is_one_thing: false, sort_order: 0,
    assignee: null, failure_cost: null,
    created_at: '2026-03-01T00:00:00Z', completed_at: null, updated_at: '2026-03-01T00:00:00Z',
    goals: { title: 'Goal', pillar_id: 'p1', priority_rank: 1, life_pillars: { id: 'p1', name: 'Health', color: '#5DCAA5', icon: '💪' } },
    ...overrides,
  } as TaskWithContext;
  return { task, score, priorityWeight: 0, deadlineWeight: 0, pillarWeight: 0 };
}

describe('buildWhyThis', () => {
  it('mentions overdue when past due date', () => {
    const result = buildWhyThis(scored({ due_date: '2020-01-01' }), 3);
    expect(result).toContain('overdue');
  });

  it('mentions P1 priority', () => {
    const result = buildWhyThis(scored({ priority: 1 }), 3);
    expect(result).toContain('P1');
  });

  it('mentions deadline when due soon', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    const result = buildWhyThis(scored({ due_date: tomorrow.toISOString().split('T')[0] }), 2);
    expect(result).toContain('Due in');
  });

  it('includes pillar context with task count', () => {
    const result = buildWhyThis(scored(), 5);
    expect(result).toContain('Health has 5 open tasks');
  });

  it('falls back to generic text when no properties are notable', () => {
    const s = scored({ priority: 4 });
    s.task.goals = { title: 'G', pillar_id: 'p1', priority_rank: 1, life_pillars: undefined as never };
    const result = buildWhyThis(s, 0);
    expect(result).toContain('highest-scoring');
  });
});
