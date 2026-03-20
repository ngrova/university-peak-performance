// ═══════════════════════════════════════════════════════════
// FILE: build-chain.ts
// PURPOSE: Turns a flat array of tasks into a linear chain for
//   the Domino Tree's Level 3 view. Detects fork points where
//   a task has multiple children and inserts special fork nodes.
//   Uses iterative traversal with a visited set to prevent loops.
// CALLED BY: hooks/use-tree-drilldown.ts
// DATA FLOW: Hook passes Task[] for a goal → buildChain processes
//   parent_task_id relationships → returns ChainNode[] for rendering
// ═══════════════════════════════════════════════════════════
import type { Task } from '@upp/db';

export interface TaskNode {
  type: 'task';
  task: Task;
}

export interface ForkInfo {
  type: 'fork';
  parentTask: Task;
  tracks: { id: string; title: string; taskCount: number }[];
}

export type ChainNode = TaskNode | ForkInfo;

/** Builds a map of parent_task_id → child tasks */
function groupByParent(tasks: Task[]): Map<string | null, Task[]> {
  const map = new Map<string | null, Task[]>();
  for (const t of tasks) {
    const key = t.parent_task_id;
    const list = map.get(key) ?? [];
    list.push(t);
    map.set(key, list);
  }
  return map;
}

/** Counts all descendants of a task (for fork track display) */
function countDescendants(taskId: string, childMap: Map<string | null, Task[]>, visited: Set<string>): number {
  if (visited.has(taskId)) return 0;
  visited.add(taskId);
  const children = childMap.get(taskId) ?? [];
  let count = children.length;
  for (const c of children) count += countDescendants(c.id, childMap, visited);
  return count;
}

/**
 * Triggered by: use-tree-drilldown hook when user views a goal's tasks.
 * Steps: finds root tasks (no parent), walks the chain iteratively.
 *   If a task has one child, continues linearly. If it has multiple
 *   children, inserts a fork node. Uses visited set to prevent loops.
 * Returns: ChainNode[] — a flat array of task and fork nodes for rendering.
 */
export function buildChain(tasks: Task[]): ChainNode[] {
  if (tasks.length === 0) return [];
  const childMap = groupByParent(tasks);
  const roots = childMap.get(null) ?? [];
  if (roots.length === 0) return tasks.map((t) => ({ type: 'task' as const, task: t }));

  const chain: ChainNode[] = [];
  const visited = new Set<string>();

  /** Walks one linear path, appending nodes to chain */
  function walk(task: Task) {
    if (visited.has(task.id)) return;
    visited.add(task.id);
    chain.push({ type: 'task', task });
    const children = childMap.get(task.id) ?? [];
    if (children.length === 1 && children[0]) {
      walk(children[0]);
    } else if (children.length > 1) {
      const tracks = children.map((c) => ({
        id: c.id,
        title: c.title,
        taskCount: 1 + countDescendants(c.id, childMap, new Set()),
      }));
      chain.push({ type: 'fork', parentTask: task, tracks });
    }
  }

  for (const root of roots) walk(root);
  return chain;
}

/** Builds a sub-chain starting from a specific fork track task */
export function buildForkTrack(tasks: Task[], rootTaskId: string): ChainNode[] {
  const rootTask = tasks.find((t) => t.id === rootTaskId);
  if (!rootTask) return [];
  const childMap = groupByParent(tasks);
  const chain: ChainNode[] = [];
  const visited = new Set<string>();

  function walk(task: Task) {
    if (visited.has(task.id)) return;
    visited.add(task.id);
    chain.push({ type: 'task', task });
    const children = childMap.get(task.id) ?? [];
    if (children.length === 1 && children[0]) {
      walk(children[0]);
    } else if (children.length > 1) {
      const tracks = children.map((c) => ({
        id: c.id, title: c.title,
        taskCount: 1 + countDescendants(c.id, childMap, new Set()),
      }));
      chain.push({ type: 'fork', parentTask: task, tracks });
    }
  }

  walk(rootTask);
  return chain;
}
