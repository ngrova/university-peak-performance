'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createServerClient, createGoal, updateGoal, deleteGoal, getGoals } from '@upp/db'
import type { CreateGoalInput } from '@upp/db'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })
}

export async function createGoalAction(pillarId: string, formData: FormData): Promise<void> {
  try {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const goals = await getGoals(supabase, pillarId)
    const description = formData.get('description') as string | null
    const targetDate = formData.get('target_date') as string | null

    const input: CreateGoalInput = {
      pillar_id: pillarId,
      title: formData.get('title') as string,
      sort_order: goals.length,
      ...(description ? { description } : {}),
      ...(targetDate ? { target_date: targetDate } : {}),
    }
    await createGoal(supabase, user.id, input)
    revalidatePath(`/pillars/${pillarId}`)
  } catch {
    // silently fail
  }
}

export async function updateGoalAction(id: string, pillarId: string, formData: FormData): Promise<void> {
  try {
    const supabase = await getSupabase()
    const description = formData.get('description') as string | null
    const targetDate = formData.get('target_date') as string | null
    await updateGoal(supabase, id, {
      title: formData.get('title') as string,
      description: description ?? null,
      target_date: targetDate ?? null,
    })
    revalidatePath(`/pillars/${pillarId}`)
  } catch {
    // silently fail
  }
}

export async function deleteGoalAction(id: string, pillarId: string): Promise<void> {
  try {
    const supabase = await getSupabase()
    await deleteGoal(supabase, id)
    revalidatePath(`/pillars/${pillarId}`)
  } catch {
    // silently fail
  }
}
