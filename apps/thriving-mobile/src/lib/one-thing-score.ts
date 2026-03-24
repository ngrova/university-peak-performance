// ═══════════════════════════════════════════════════════════
// FILE: one-thing-score.ts
// PURPOSE: Scores tasks to determine the One Thing — the single
//   most important task for today. Uses priority + deadline weights.
//   Structured so assessment pillar scores can plug in as an
//   additional weight later without a rewrite.
// CALLED BY: components/TodayContent.tsx
// DATA FLOW: TaskWithContext[] → scoreTask per task → sort by
//   score descending → highest = One Thing, next 3 = Up Next
// ═══════════════════════════════════════════════════════════

import type { TaskWithContext } from '@upp/db';

// Priority weight: P1 is most urgent
const PRIORITY_WEIGHT: Record<number, number> = { 1: 40, 2: 30, 3: 20, 4: 10 };

export interface ScoredTask {
  task: TaskWithContext;
  score: number;
  priorityWeight: number;
  deadlineWeight: number;
  pillarWeight: number;
}

/** Calculates deadline weight based on how soon/overdue the task is */
function deadlineWeight(dueDate: string | null): number {
  if (!dueDate) return 0;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const daysUntil = Math.floor((due.getTime() - now.getTime()) / 86400000);
  if (daysUntil < 0) return 50;   // overdue
  if (daysUntil === 0) return 40;  // due today
  if (daysUntil <= 7) return 30;   // due this week
  if (daysUntil <= 30) return 15;  // due this month
  return 0;
}

/**
 * Triggered by: TodayContent after fetching tasks.
 * Steps: filters to active tasks, scores each by priority + deadline
 *   weights (+ pillar placeholder), sorts by score then creation date.
 * Returns: sorted array of scored tasks, highest first.
 */
export function rankTasks(tasks: TaskWithContext[]): ScoredTask[] {
  // Exclude unsorted tasks (no goal = no pillar context = can't rank)
  const active = tasks.filter((t) => (t.status === 'todo' || t.status === 'in_progress') && t.goal_id !== null);
  return active.map((task) => {
    const pw = PRIORITY_WEIGHT[task.priority] ?? 0;
    const dw = deadlineWeight(task.due_date);
    // Placeholder: pillar assessment weight plugs in here later
    const pillarW = 0;
    return { task, score: pw + dw + pillarW, priorityWeight: pw, deadlineWeight: dw, pillarWeight: pillarW };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tie-break: oldest task first (by creation date)
    return new Date(a.task.created_at).getTime() - new Date(b.task.created_at).getTime();
  });
}
