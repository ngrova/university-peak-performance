export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: 1 | 2 | 3 | 4;
  is_one_thing: boolean;
  due_date: string | null; // ISO date string YYYY-MM-DD
  created_at: string;      // ISO timestamp
}

function compareByDueDate(a: Task, b: Task): number {
  if (a.due_date !== null && b.due_date !== null) {
    return a.due_date.localeCompare(b.due_date);
  }
  if (a.due_date !== null) return -1;
  if (b.due_date !== null) return 1;
  return 0;
}

function compareByRecency(a: Task, b: Task): number {
  // Most recently created wins (descending)
  return b.created_at.localeCompare(a.created_at);
}

/**
 * Selects the single highest-priority incomplete task (the "One Thing").
 *
 * Priority chain:
 * 1. Manual override (is_one_thing === true)
 * 2. Priority value (1 is highest, 4 is lowest)
 * 3. Due date (soonest first)
 * 4. Most recently created
 *
 * @param tasks - All tasks for the user (any status)
 * @returns The selected task or null if no incomplete tasks exist
 */
export function selectOneThing(tasks: Task[]): Task | null {
  const incomplete = tasks.filter((t) => t.status !== 'done');

  if (incomplete.length === 0) return null;

  const override = incomplete.find((t) => t.is_one_thing);
  if (override !== undefined) return override;

  const sorted = [...incomplete].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const dateCompare = compareByDueDate(a, b);
    if (dateCompare !== 0) return dateCompare;
    return compareByRecency(a, b);
  });

  return sorted[0] ?? null;
}
