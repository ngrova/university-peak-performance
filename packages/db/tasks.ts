import type { SupabaseClient } from '@supabase/supabase-js'
import type { Task, FailureCost, TaskAssignee } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

export async function getTasksByGoal(
  supabase: AnyClient,
  goalId: string,
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('goal_id', goalId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export interface CreateTaskInput {
  goal_id: string
  title: string
  notes?: string
  due_date?: string
  priority?: 1 | 2 | 3 | 4
  sort_order: number
  assignee?: TaskAssignee
  failure_cost?: FailureCost
}

export async function createTask(
  supabase: AnyClient,
  userId: string,
  input: CreateTaskInput,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...input, user_id: userId, status: 'todo' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(
  supabase: AnyClient,
  id: string,
  updates: Partial<Pick<Task, 'title' | 'notes' | 'due_date' | 'priority' | 'status' | 'sort_order' | 'completed_at' | 'assignee' | 'failure_cost' | 'is_one_thing'>>,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(
  supabase: AnyClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  if (error) throw error
}
