'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createServerClient, updateTask, unpinOneThingForUser } from '@upp/db'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })
}

// Pin a task as the user's One Thing, unpinning any existing one first
export async function pinOneThingAction(taskId: string, goalId: string, pillarId: string): Promise<{ error?: string }> {
  try {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated — please sign in again' }
    await unpinOneThingForUser(supabase, user.id)
    await updateTask(supabase, taskId, { is_one_thing: true })
    revalidatePath(`/pillars/${pillarId}/goals/${goalId}`)
    revalidatePath('/one-thing')
    return {}
  } catch {
    return { error: 'Failed to set One Thing — try again' }
  }
}

export async function markOneThingDoneAction(taskId: string): Promise<void> {
  try {
    const supabase = await getSupabase()
    await updateTask(supabase, taskId, {
      status: 'done',
      completed_at: new Date().toISOString(),
    })
    revalidatePath('/one-thing')
  } catch {
    // silently fail — page will show stale data at worst
  }
}

export async function skipOneThingAction(taskId: string, wasPinned: boolean): Promise<void> {
  try {
    if (!wasPinned) return
    const supabase = await getSupabase()
    await updateTask(supabase, taskId, { is_one_thing: false })
    revalidatePath('/one-thing')
  } catch {
    // silently fail
  }
}
