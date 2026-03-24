// ═══════════════════════════════════════════════════════════
// FILE: why-this.ts
// PURPOSE: Generates a 1-2 sentence explanation of why a task
//   was chosen as the One Thing. Builds from task properties:
//   overdue status, priority level, deadline proximity, and
//   pillar context (open task count).
// CALLED BY: components/TodayHero.tsx
// DATA FLOW: ScoredTask + open task count → template logic →
//   plain-English explanation string
// ═══════════════════════════════════════════════════════════

import type { ScoredTask } from '@/lib/one-thing-score';

/**
 * Triggered by: TodayHero when rendering the "Why this?" box.
 * Steps: checks the task's properties — overdue, priority, deadline,
 *   pillar context — and builds natural sentences from templates.
 * Returns: a 1-2 sentence explanation string.
 */
export function buildWhyThis(scored: ScoredTask, pillarTaskCount: number): string {
  const parts: string[] = [];
  const task = scored.task;
  const pillarName = task.goals?.life_pillars?.name;

  // Overdue check
  if (task.due_date) {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const due = new Date(task.due_date); due.setHours(0, 0, 0, 0);
    const daysLate = Math.floor((now.getTime() - due.getTime()) / 86400000);
    if (daysLate > 0) {
      parts.push(`This is overdue by ${daysLate} day${daysLate === 1 ? '' : 's'}.`);
    } else if (daysLate === 0) {
      parts.push('This is due today.');
    } else {
      const daysUntil = Math.abs(daysLate);
      parts.push(`Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}.`);
    }
  }

  // Priority check
  if (task.priority === 1) parts.push('This is a P1 — your highest priority level.');
  else if (task.priority === 2 && parts.length === 0) parts.push('This is a P2 — high priority.');

  // Pillar context
  if (pillarName && pillarTaskCount > 0) {
    parts.push(`${pillarName} has ${pillarTaskCount} open task${pillarTaskCount === 1 ? '' : 's'}.`);
  }

  return parts.length > 0 ? parts.join(' ') : 'This is your highest-scoring task right now.';
}
