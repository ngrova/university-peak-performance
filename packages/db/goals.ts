import type { SupabaseClient } from '@supabase/supabase-js'
import type { Goal } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

export async function getGoals(
  supabase: AnyClient,
  pillarId: string,
): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, user_id, pillar_id, title, description, target_date, status, sort_order, color, priority_rank, created_at, updated_at')
    .eq('pillar_id', pillarId)
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
    .limit(100)
  if (error) throw error
  return data
}

export interface CreateGoalInput {
  pillar_id: string
  title: string
  description?: string
  target_date?: string
  sort_order: number
  color?: string
  priority_rank?: number
}

export async function createGoal(
  supabase: AnyClient,
  userId: string,
  input: CreateGoalInput,
): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...input, user_id: userId })
    .select('id, user_id, pillar_id, title, description, target_date, status, sort_order, color, priority_rank, created_at, updated_at')
    .single()
  if (error) throw error
  return data
}

export async function updateGoal(
  supabase: AnyClient,
  id: string,
  updates: Partial<Pick<Goal, 'title' | 'description' | 'target_date' | 'status' | 'sort_order' | 'color' | 'priority_rank'>>,
): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, user_id, pillar_id, title, description, target_date, status, sort_order, color, priority_rank, created_at, updated_at')
    .single()
  if (error) throw error
  return data
}

export type GoalWithProgress = Goal & {
  taskCount: number
  completedTaskCount: number
}

/** Fetches goals for a pillar with task completion counts */
export async function getGoalsWithProgress(
  supabase: AnyClient,
  pillarId: string,
): Promise<GoalWithProgress[]> {
  const goals = await getGoals(supabase, pillarId)
  if (goals.length === 0) return []
  const goalIds = goals.map((g) => g.id)
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('goal_id, status')
    .in('goal_id', goalIds)
    .limit(500)
  if (error) throw error
  return goals.map((goal) => {
    const goalTasks = (tasks ?? []).filter((t) => t.goal_id === goal.id)
    return {
      ...goal,
      taskCount: goalTasks.length,
      completedTaskCount: goalTasks.filter((t) => t.status === 'done').length,
    }
  })
}

export async function deleteGoal(
  supabase: AnyClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
  if (error) throw error
}
