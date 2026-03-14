import type { SupabaseClient } from '@supabase/supabase-js'
import type { Task, FailureCost } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

export interface TaskWithContext extends Task {
  goals: {
    title: string
    pillar_id: string
    life_pillars: {
      id: string
      name: string
      color: string
      icon: string
    }
  }
}

const CONTEXT_SELECT = `*, goals(title, pillar_id, life_pillars(id, name, color, icon))`

const FAILURE_COST_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
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
  return active.sort(sortByCost)[0] ?? null
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
