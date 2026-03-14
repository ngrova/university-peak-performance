import type { SupabaseClient } from '@supabase/supabase-js'
import type { LifePillar } from './types'

export async function getPillars(
  supabase: SupabaseClient,
  userId: string,
): Promise<LifePillar[]> {
  const { data, error } = await supabase
    .from('life_pillars')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('sort_order', { ascending: true })
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
  supabase: SupabaseClient,
  userId: string,
  input: CreatePillarInput,
): Promise<LifePillar> {
  const { data, error } = await supabase
    .from('life_pillars')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePillar(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Pick<LifePillar, 'name' | 'icon' | 'color' | 'sort_order' | 'is_archived'>>,
): Promise<LifePillar> {
  const { data, error } = await supabase
    .from('life_pillars')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePillar(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('life_pillars')
    .delete()
    .eq('id', id)
  if (error) throw error
}
