import type { SupabaseClient } from '@supabase/supabase-js'
import type { Goal } from './types'

export async function getGoals(
  supabase: SupabaseClient,
  pillarId: string,
): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('pillar_id', pillarId)
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export interface CreateGoalInput {
  pillar_id: string
  title: string
  description?: string
  target_date?: string
  sort_order: number
}

export async function createGoal(
  supabase: SupabaseClient,
  userId: string,
  input: CreateGoalInput,
): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateGoal(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Pick<Goal, 'title' | 'description' | 'target_date' | 'status' | 'sort_order'>>,
): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteGoal(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
  if (error) throw error
}
