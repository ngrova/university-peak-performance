'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createServerClient, createPillar, updatePillar, deletePillar, getPillars } from '@upp/db'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })
}

export async function createPillarAction(formData: FormData): Promise<void> {
  try {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const pillars = await getPillars(supabase, user.id)
    await createPillar(supabase, user.id, {
      name: formData.get('name') as string,
      icon: (formData.get('icon') as string) || '🎯',
      color: (formData.get('color') as string) || '#6366f1',
      sort_order: pillars.length,
    })
    revalidatePath('/dashboard')
  } catch {
    // silently fail — no throw to client
  }
}

export async function updatePillarAction(id: string, formData: FormData): Promise<void> {
  try {
    const supabase = await getSupabase()
    await updatePillar(supabase, id, {
      name: formData.get('name') as string,
      icon: (formData.get('icon') as string) || '🎯',
      color: (formData.get('color') as string) || '#6366f1',
    })
    revalidatePath('/dashboard')
  } catch {
    // silently fail
  }
}

export async function deletePillarAction(id: string): Promise<void> {
  try {
    const supabase = await getSupabase()
    await deletePillar(supabase, id)
    revalidatePath('/dashboard')
  } catch {
    // silently fail
  }
}
