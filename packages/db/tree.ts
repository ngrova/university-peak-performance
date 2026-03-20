import type { SupabaseClient } from '@supabase/supabase-js'
import type { LifePillar, Goal, Task } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

export interface TreeData {
  pillars: LifePillar[]
  goals: Goal[]
  tasks: Task[]
}

export async function getTreeData(supabase: AnyClient, userId: string): Promise<TreeData> {
  const [pillarsRes, goalsRes, tasksRes] = await Promise.all([
    supabase
      .from('life_pillars')
      .select('id, user_id, name, icon, color, sort_order, is_archived, created_at, updated_at')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('sort_order', { ascending: true })
      .limit(50),
    supabase
      .from('goals')
      .select('id, user_id, pillar_id, title, description, target_date, status, sort_order, color, priority_rank, created_at, updated_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(200),
    supabase
      .from('tasks')
      .select('id, user_id, goal_id, parent_task_id, title, notes, due_date, priority, status, is_one_thing, sort_order, assignee, failure_cost, created_at, completed_at, updated_at')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .limit(500),
  ])

  if (pillarsRes.error) throw pillarsRes.error
  if (goalsRes.error) throw goalsRes.error
  if (tasksRes.error) throw tasksRes.error

  return {
    pillars: pillarsRes.data ?? [],
    goals: goalsRes.data ?? [],
    tasks: tasksRes.data ?? [],
  }
}
