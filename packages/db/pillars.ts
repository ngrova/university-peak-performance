import type { SupabaseClient } from '@supabase/supabase-js'
import type { LifePillar } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

export type PillarWithProgress = LifePillar & {
  goalCount: number
  taskCount: number
  completedTaskCount: number
}

export async function getPillarsWithProgress(
  supabase: AnyClient,
  userId: string,
): Promise<PillarWithProgress[]> {
  const pillars = await getPillars(supabase, userId)
  if (pillars.length === 0) return []

  const pillarIds = pillars.map((p) => p.id)

  const [goalsRes, tasksRes] = await Promise.all([
    supabase
      .from('goals')
      .select('id, pillar_id')
      .in('pillar_id', pillarIds)
      .eq('status', 'active')
      .limit(500),
    supabase
      .from('tasks')
      .select('goal_id, status')
      .eq('user_id', userId)
      .limit(500),
  ])
  if (goalsRes.error) throw goalsRes.error
  if (tasksRes.error) throw tasksRes.error

  const goals = goalsRes.data ?? []
  const tasks = tasksRes.data ?? []

  const goalIdsByPillar = new Map<string, string[]>()
  for (const g of goals) {
    const list = goalIdsByPillar.get(g.pillar_id) ?? []
    list.push(g.id)
    goalIdsByPillar.set(g.pillar_id, list)
  }

  return pillars.map((pillar) => {
    const pillarGoalIds = new Set(goalIdsByPillar.get(pillar.id) ?? [])
    const pillarTasks = tasks.filter((t) => pillarGoalIds.has(t.goal_id))
    return {
      ...pillar,
      goalCount: pillarGoalIds.size,
      taskCount: pillarTasks.length,
      completedTaskCount: pillarTasks.filter((t) => t.status === 'done').length,
    }
  })
}

export async function getPillars(
  supabase: AnyClient,
  userId: string,
): Promise<LifePillar[]> {
  const { data, error } = await supabase
    .from('life_pillars')
    .select('id, user_id, name, icon, color, sort_order, is_archived, created_at, updated_at')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('sort_order', { ascending: true })
    .limit(50)
  if (error) throw error
  return data
}

export interface CreatePillarInput {
  name: string
  icon: string
  color: string
  sort_order: number
}

export async function createPillar(
  supabase: AnyClient,
  userId: string,
  input: CreatePillarInput,
): Promise<LifePillar> {
  const { data, error } = await supabase
    .from('life_pillars')
    .insert({ ...input, user_id: userId })
    .select('id, user_id, name, icon, color, sort_order, is_archived, created_at, updated_at')
    .single()
  if (error) throw error
  return data
}

export async function updatePillar(
  supabase: AnyClient,
  id: string,
  updates: Partial<Pick<LifePillar, 'name' | 'icon' | 'color' | 'sort_order' | 'is_archived'>>,
): Promise<LifePillar> {
  const { data, error } = await supabase
    .from('life_pillars')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, user_id, name, icon, color, sort_order, is_archived, created_at, updated_at')
    .single()
  if (error) throw error
  return data
}

export async function deletePillar(
  supabase: AnyClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('life_pillars')
    .delete()
    .eq('id', id)
  if (error) throw error
}
