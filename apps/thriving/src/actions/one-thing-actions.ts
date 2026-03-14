'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createServerClient, updateTask } from '@upp/db'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })
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
