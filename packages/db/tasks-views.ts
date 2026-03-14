import type { SupabaseClient } from '@supabase/supabase-js'
import type { Task, FailureCost } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

export interface TaskWithContext extends Task {
  goals: {
    title: string
    pillar_id: string
    priority_rank: number
    life_pillars: {
      id: string
      name: string
      color: string
      icon: string
    }
  }
}

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

function scoreTask(t: TaskWithContext): number {
  const costWeight = FAILURE_COST_WEIGHT[t.failure_cost ?? 'low'] ?? 10
  const goalRank = t.goals?.priority_rank ?? 5
  const priorityScore = 4 - t.priority + 1
  const urgency = dueDateUrgency(t.due_date)
  return costWeight + goalRank + priorityScore + urgency
}

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

export async function getOneThingTask(
  supabase: AnyClient,
  userId: string,
): Promise<TaskWithContext | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(CONTEXT_SELECT)
    .eq('user_id', userId)
    .neq('status', 'done')
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

export async function getTasksWithDeadlines(
  supabase: AnyClient,
  userId: string,
): Promise<TaskWithContext[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(CONTEXT_SELECT)
    .eq('user_id', userId)
    .neq('status', 'done')
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })
  if (error) throw error
  return data ?? []
}

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
  if (assignee) {
    query = query.eq('assignee', assignee)
  }
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).sort(sortByCost)
}

export { FAILURE_COST_ORDER }
export type { FailureCost }
