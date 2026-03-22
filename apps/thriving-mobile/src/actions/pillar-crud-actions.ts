// ═══════════════════════════════════════════════════════════
// FILE: pillar-crud-actions.ts
// PURPOSE: Server actions for creating, editing, reordering, and
//   archiving pillars. Each action auto-saves a single change so
//   the UI can fire updates on blur without a save button.
// CALLED BY: components/PillarEditSheet.tsx, components/AddPillarButton.tsx
// DATA FLOW: UI event (blur, tap) → server action here → @upp/db
//   writes to Supabase → revalidates cached pages → UI refreshes
// ═══════════════════════════════════════════════════════════
'use server';

import { createPillar, updatePillar, getPillars } from '@upp/db';
import type { LifePillar } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';
import { reportError } from '@/lib/report-error';
import { revalidatePath } from 'next/cache';

type PillarField = keyof Pick<LifePillar, 'name' | 'icon' | 'color'>;

/**
 * Triggered by: user taps "Add" in the AddPillarButton component.
 * Steps: checks auth, resolves delegation, counts existing pillars
 *   for sort_order (monotonic counter), inserts the new pillar.
 * Returns: empty object on success, or { error } with message.
 */
export async function createPillarAction(
  name: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    const targetUserId = await getActingAsUserId(supabase, user.id);
    // CAUTION: sort_order is int4 — use array.length, NEVER Date.now()
    const existing = await getPillars(supabase, targetUserId);
    await createPillar(supabase, targetUserId, {
      name,
      icon: '🎯',
      color: '#6366f1',
      sort_order: existing.length,
    });
    revalidatePath('/goals');
    return {};
  } catch (err) {
    reportError(err);
    return { error: 'Failed to create pillar — try again' };
  }
}

/**
 * Triggered by: user edits a field in PillarEditSheet (fires on blur/change).
 * Steps: connects to Supabase, updates the single field on the pillar
 *   row, then refreshes the Goals screen cache.
 * Returns: empty object on success, or { error } with message.
 */
export async function updatePillarField(
  pillarId: string,
  field: PillarField,
  value: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    await updatePillar(supabase, pillarId, { [field]: value });
    revalidatePath('/goals');
    return {};
  } catch (err) {
    reportError(err);
    return { error: 'Failed to save — try again' };
  }
}

/**
 * Triggered by: user taps "Archive" in the PillarEditSheet.
 * Steps: connects to Supabase, sets is_archived to true, which
 *   hides the pillar and its goals/tasks from active views.
 * Returns: empty object on success, or { error } with message.
 */
export async function archivePillar(
  pillarId: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    await updatePillar(supabase, pillarId, { is_archived: true });
    revalidatePath('/goals');
    return {};
  } catch (err) {
    reportError(err);
    return { error: 'Failed to archive — try again' };
  }
}

