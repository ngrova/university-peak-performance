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
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('sort_order', { ascending: true }),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('sort_order', { ascending: true }),
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true }),
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
