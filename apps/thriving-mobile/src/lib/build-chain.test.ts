import { describe, it, expect } from 'vitest';
import { buildChain, buildForkTrack } from './build-chain';
import type { Task } from '@upp/db';

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    user_id: 'u1', goal_id: 'g1', parent_task_id: null,
    title: overrides.id, notes: null, due_date: null, priority: 2,
    status: 'todo', is_one_thing: false, sort_order: 0, assignee: null,
    failure_cost: null, created_at: '', completed_at: null, updated_at: '',
    ...overrides,
  };
}

describe('buildChain', () => {
  it('returns empty array for no tasks', () => {
    expect(buildChain([])).toEqual([]);
  });

  it('builds a linear chain from root → child → grandchild', () => {
    const tasks = [
      makeTask({ id: 'a', sort_order: 0 }),
      makeTask({ id: 'b', parent_task_id: 'a', sort_order: 1 }),
      makeTask({ id: 'c', parent_task_id: 'b', sort_order: 2 }),
    ];
    const chain = buildChain(tasks);
    expect(chain).toHaveLength(3);
    expect(chain.map((n) => n.type)).toEqual(['task', 'task', 'task']);
  });

  it('detects a fork when a task has multiple children', () => {
    const tasks = [
      makeTask({ id: 'root', sort_order: 0 }),
      makeTask({ id: 'a', parent_task_id: 'root', sort_order: 1 }),
      makeTask({ id: 'b', parent_task_id: 'root', sort_order: 2 }),
    ];
    const chain = buildChain(tasks);
    expect(chain).toHaveLength(2);
    expect(chain[0]?.type).toBe('task');
    expect(chain[1]?.type).toBe('fork');
    if (chain[1]?.type === 'fork') {
      expect(chain[1].tracks).toHaveLength(2);
      expect(chain[1].tracks[0]?.title).toBe('a');
      expect(chain[1].tracks[1]?.title).toBe('b');
    }
  });

  it('handles flat tasks with no parent (all roots)', () => {
    const tasks = [
      makeTask({ id: 'x', sort_order: 0 }),
      makeTask({ id: 'y', sort_order: 1 }),
    ];
    const chain = buildChain(tasks);
    expect(chain).toHaveLength(2);
    expect(chain.every((n) => n.type === 'task')).toBe(true);
  });

  it('counts descendants in fork tracks', () => {
    const tasks = [
      makeTask({ id: 'root', sort_order: 0 }),
      makeTask({ id: 'a', parent_task_id: 'root', sort_order: 1 }),
      makeTask({ id: 'b', parent_task_id: 'root', sort_order: 2 }),
      makeTask({ id: 'a1', parent_task_id: 'a', sort_order: 3 }),
      makeTask({ id: 'a2', parent_task_id: 'a', sort_order: 4 }),
    ];
    const chain = buildChain(tasks);
    const fork = chain.find((n) => n.type === 'fork');
    expect(fork?.type).toBe('fork');
    if (fork?.type === 'fork') {
      const trackA = fork.tracks.find((t) => t.id === 'a');
      expect(trackA?.taskCount).toBe(3);
      const trackB = fork.tracks.find((t) => t.id === 'b');
      expect(trackB?.taskCount).toBe(1);
    }
  });
});

describe('buildForkTrack', () => {
  it('builds a sub-chain from a specific fork track root', () => {
    const tasks = [
      makeTask({ id: 'root', sort_order: 0 }),
      makeTask({ id: 'a', parent_task_id: 'root', sort_order: 1 }),
      makeTask({ id: 'b', parent_task_id: 'root', sort_order: 2 }),
      makeTask({ id: 'a1', parent_task_id: 'a', sort_order: 3 }),
    ];
    const track = buildForkTrack(tasks, 'a');
    expect(track).toHaveLength(2);
    expect(track[0]?.type === 'task' && track[0].task.id).toBe('a');
    expect(track[1]?.type === 'task' && track[1].task.id).toBe('a1');
  });

  it('returns empty for nonexistent root', () => {
    expect(buildForkTrack([], 'nope')).toEqual([]);
  });
});
