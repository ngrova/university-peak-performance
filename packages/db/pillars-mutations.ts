import type { SupabaseClient } from '@supabase/supabase-js'
import type { LifePillar } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

export interface CreatePillarInput {
  name: string
  icon: string
  color: string
  sort_order: number
}

// Inserts a new life pillar under the given user's account
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

// Updates a pillar's name, icon, color, sort order, or archive status
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

// Permanently removes a pillar and cascades to its goals and tasks
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
