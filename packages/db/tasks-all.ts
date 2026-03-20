import type { SupabaseClient } from '@supabase/supabase-js'
import type { TaskWithContext } from './tasks-views'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

const CONTEXT_SELECT = `id, user_id, goal_id, parent_task_id, title, notes, due_date, priority, status, is_one_thing, sort_order, assignee, failure_cost, created_at, completed_at, updated_at, goals(title, pillar_id, priority_rank, life_pillars(id, name, color, icon))`

/** Returns all tasks for a user with goal/pillar context */
export async function getAllTasksWithContext(
  supabase: AnyClient,
  userId: string,
): Promise<TaskWithContext[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(CONTEXT_SELECT)
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .limit(200)
  if (error) throw error
  // Supabase returns nested joins as arrays; flatten to single objects
  return (data ?? []).map((row): TaskWithContext => {
    const goalsArr = row.goals as Record<string, unknown>[] | undefined
    const goal = goalsArr?.[0] as Record<string, unknown> | undefined
    const pillarsArr = goal?.life_pillars as Record<string, unknown>[] | undefined
    return { ...row, goals: { ...goal, life_pillars: pillarsArr?.[0] } } as TaskWithContext
  })
}
