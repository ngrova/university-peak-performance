import type { SupabaseClient } from '@supabase/supabase-js'
import type { Task, FailureCost, TaskAssignee } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

// Explicit column list for all task queries
const TASK_COLUMNS = 'id, user_id, goal_id, parent_task_id, title, notes, due_date, priority, status, is_one_thing, sort_order, assignee, failure_cost, created_at, completed_at, updated_at'

export async function getTasksByGoal(
  supabase: AnyClient,
  goalId: string,
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_COLUMNS)
    .eq('goal_id', goalId)
    .order('sort_order', { ascending: true })
    .limit(50)
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
    .select(TASK_COLUMNS)
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
    .select(TASK_COLUMNS)
    .single()
  if (error) throw error
  return data
}

// Unpin any currently pinned One Thing for a user
export async function unpinOneThingForUser(
  supabase: AnyClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ is_one_thing: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_one_thing', true)
  if (error) throw error
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
