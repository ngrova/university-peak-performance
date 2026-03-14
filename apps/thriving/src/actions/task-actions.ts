'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createServerClient, getTasksByGoal, createTask, updateTask, deleteTask } from '@upp/db'
import type { Task, FailureCost, TaskAssignee } from '@upp/db'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })
}

function nextStatus(current: Task['status']): Task['status'] {
  if (current === 'todo') return 'in_progress'
  if (current === 'in_progress') return 'done'
  return 'todo'
}

export async function createTaskAction(goalId: string, pillarId: string, formData: FormData): Promise<void> {
  try {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const tasks = await getTasksByGoal(supabase, goalId)
    const notes = formData.get('notes') as string | null
    const dueDate = formData.get('due_date') as string | null
    const priorityRaw = formData.get('priority') as string | null
    const priority = priorityRaw ? (parseInt(priorityRaw, 10) as 1 | 2 | 3 | 4) : 4
    const assigneeRaw = formData.get('assignee') as string | null
    const failureCostRaw = formData.get('failure_cost') as string | null

    await createTask(supabase, user.id, {
      goal_id: goalId,
      title: formData.get('title') as string,
      sort_order: tasks.length,
      ...(notes ? { notes } : {}),
      ...(dueDate ? { due_date: dueDate } : {}),
      priority,
      ...(assigneeRaw ? { assignee: assigneeRaw as TaskAssignee } : {}),
      ...(failureCostRaw ? { failure_cost: failureCostRaw as FailureCost } : {}),
    })
    revalidatePath(`/pillars/${pillarId}/goals/${goalId}`)
  } catch {
    // silently fail
  }
}

export async function updateTaskAction(id: string, goalId: string, pillarId: string, formData: FormData): Promise<void> {
  try {
    const supabase = await getSupabase()
    const notes = formData.get('notes') as string | null
    const dueDate = formData.get('due_date') as string | null
    const priorityRaw = formData.get('priority') as string | null
    const priority = priorityRaw ? (parseInt(priorityRaw, 10) as 1 | 2 | 3 | 4) : 4
    const assigneeRaw = formData.get('assignee') as string | null
    const failureCostRaw = formData.get('failure_cost') as string | null

    await updateTask(supabase, id, {
      title: formData.get('title') as string,
      notes: notes ?? null,
      due_date: dueDate ?? null,
      priority,
      assignee: (assigneeRaw || null) as TaskAssignee | null,
      failure_cost: (failureCostRaw || null) as FailureCost | null,
    })
    revalidatePath(`/pillars/${pillarId}/goals/${goalId}`)
  } catch {
    // silently fail
  }
}

export async function deleteTaskAction(id: string, goalId: string, pillarId: string): Promise<void> {
  try {
    const supabase = await getSupabase()
    await deleteTask(supabase, id)
    revalidatePath(`/pillars/${pillarId}/goals/${goalId}`)
  } catch {
    // silently fail
  }
}

export async function updateTaskStatusAction(task: Pick<Task, 'id' | 'status'>, goalId: string, pillarId: string): Promise<void> {
  try {
    const supabase = await getSupabase()
    const status = nextStatus(task.status)
    const completedAt: string | null = status === 'done' ? new Date().toISOString() : null
    await updateTask(supabase, task.id, { status, completed_at: completedAt })
    revalidatePath(`/pillars/${pillarId}/goals/${goalId}`)
  } catch {
    // silently fail
  }
}
