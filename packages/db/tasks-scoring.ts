import type { SupabaseClient } from '@supabase/supabase-js'
import type { FailureCost } from './types'
import type { TaskWithContext } from './tasks-context'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

// NOTE: The * on tasks is required for Supabase's TypeScript inference on
// join queries. Replacing with explicit columns breaks type narrowing and
// returns Record<string, any>. The TaskWithContext interface constrains
// which columns are actually consumed by the application.
const CONTEXT_SELECT = `*, goals(title, pillar_id, priority_rank, life_pillars(id, name, color, icon))`

const FAILURE_COST_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

const FAILURE_COST_WEIGHT: Record<string, number> = {
  critical: 40,
  high: 30,
  medium: 20,
  low: 10,
}

// Converts a due date into a 0-100 urgency score (higher = more urgent)
function dueDateUrgency(dueDate: string | null): number {
  if (!dueDate) return 0
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (diffDays < 0) return 100
  if (diffDays < 1) return 90
  if (diffDays < 3) return 80
  if (diffDays < 7) return 70
  if (diffDays < 14) return 50
  if (diffDays < 30) return 30
  if (diffDays < 90) return 10
  return 0
}

// Combines failure cost, goal rank, priority, and deadline urgency into a single score
function scoreTask(t: TaskWithContext): number {
  const costWeight = FAILURE_COST_WEIGHT[t.failure_cost ?? 'low'] ?? 10
  const goalRank = t.goals?.priority_rank ?? 5
  const priorityScore = 4 - t.priority + 1
  const urgency = dueDateUrgency(t.due_date)
  return costWeight + goalRank + priorityScore + urgency
}

// Sorts tasks by failure cost, then priority, then deadline
function sortByCost(a: TaskWithContext, b: TaskWithContext): number {
  const aCost = FAILURE_COST_ORDER[a.failure_cost ?? 'low'] ?? 3
  const bCost = FAILURE_COST_ORDER[b.failure_cost ?? 'low'] ?? 3
  if (aCost !== bCost) return aCost - bCost
  if (a.priority !== b.priority) return a.priority - b.priority
  if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
  if (a.due_date) return -1
  if (b.due_date) return 1
  return 0
}

// Returns the user's pinned One Thing, or the highest-scoring active task
export async function getOneThingTask(
  supabase: AnyClient,
  userId: string,
): Promise<TaskWithContext | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(CONTEXT_SELECT)
    .eq('user_id', userId)
    .neq('status', 'done')
    .limit(200)
  if (error) throw error
  const tasks: TaskWithContext[] = data ?? []
  const pinned = tasks.find((t) => t.is_one_thing)
  if (pinned) return pinned
  const active = tasks.filter(
    (t) => t.status === 'todo' || t.status === 'in_progress',
  )
  if (active.length === 0) return null
  return active.sort((a, b) => scoreTask(b) - scoreTask(a))[0] ?? null
}

// Returns active tasks sorted by failure cost, priority, and deadline for the Up Next queue
export async function getTasksForQueue(
  supabase: AnyClient,
  userId: string,
  assignee?: string,
): Promise<TaskWithContext[]> {
  let query = supabase
    .from('tasks')
    .select(CONTEXT_SELECT)
    .eq('user_id', userId)
    .neq('status', 'done')
    .limit(200)
  if (assignee) {
    query = query.eq('assignee', assignee)
  }
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).sort(sortByCost)
}

export { FAILURE_COST_ORDER }
export type { FailureCost }
