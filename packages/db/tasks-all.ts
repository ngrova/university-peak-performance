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
  // PostgREST returns many-to-one joins as objects, not arrays — handle both shapes
  // Tasks with null goal_id get goals: null (unsorted tasks)
  return (data ?? []).map((row): TaskWithContext => {
    const raw = row.goals as Record<string, unknown> | Record<string, unknown>[] | null
    const goal = Array.isArray(raw) ? raw[0] as Record<string, unknown> | undefined : raw
    if (!goal) return { ...row, goals: null } as TaskWithContext
    const rawPillar = goal.life_pillars as Record<string, unknown> | Record<string, unknown>[] | null
    const pillar = Array.isArray(rawPillar) ? rawPillar[0] as Record<string, unknown> | undefined : rawPillar
    return { ...row, goals: { ...goal, life_pillars: pillar } } as TaskWithContext
  })
}
