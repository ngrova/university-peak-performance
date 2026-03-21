import type { SupabaseClient } from '@supabase/supabase-js'
import type { Task } from './types'

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

// NOTE: The * on tasks is required for Supabase's TypeScript inference on
// join queries. Replacing with explicit columns breaks type narrowing and
// returns Record<string, any>. The TaskWithContext interface constrains
// which columns are actually consumed by the application.
const CONTEXT_SELECT = `*, goals(title, pillar_id, priority_rank, life_pillars(id, name, color, icon))`

// Returns tasks with deadlines, ordered soonest first, for the Overdue & Due Today section
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
    .limit(200)
  if (error) throw error
  return data ?? []
}

// Fetches tasks for a goal with goal/pillar context for display
export async function getTasksByGoalWithContext(
  supabase: AnyClient,
  goalId: string,
): Promise<TaskWithContext[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(CONTEXT_SELECT)
    .eq('goal_id', goalId)
    .order('sort_order', { ascending: true })
    .limit(50)
  if (error) throw error
  return data ?? []
}
