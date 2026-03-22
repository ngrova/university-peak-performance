// ═══════════════════════════════════════════════════════════
// FILE: pillar-reorder-action.ts
// PURPOSE: Server action for reordering pillars by swapping
//   sort_order values between adjacent pillars. Split from
//   pillar-crud-actions.ts to stay within 3-export limit.
// CALLED BY: components/PillarEditSheet.tsx
// DATA FLOW: User taps move up/down → server action here →
//   @upp/db swaps sort_order on two pillars → revalidates cache
// ═══════════════════════════════════════════════════════════
'use server';

import { updatePillar, getPillars } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';
import { reportError } from '@/lib/report-error';
import { revalidatePath } from 'next/cache';

/**
 * Triggered by: user taps move up/down in PillarEditSheet.
 * Steps: loads all pillars, finds the target and its neighbor,
 *   swaps their sort_order values so the pillar moves one position.
 * Returns: empty object on success, or { error } with message.
 */
export async function reorderPillar(
  pillarId: string,
  direction: 'up' | 'down',
): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };
    const targetUserId = await getActingAsUserId(supabase, user.id);
    const pillars = await getPillars(supabase, targetUserId);
    const idx = pillars.findIndex((p) => p.id === pillarId);
    if (idx < 0) return { error: 'Pillar not found' };
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= pillars.length) return {};
    const current = pillars[idx]!;
    const neighbor = pillars[swapIdx]!;
    await Promise.all([
      updatePillar(supabase, current.id, { sort_order: neighbor.sort_order }),
      updatePillar(supabase, neighbor.id, { sort_order: current.sort_order }),
    ]);
    revalidatePath('/goals');
    return {};
  } catch (err) {
    reportError(err);
    return { error: 'Failed to reorder — try again' };
  }
}
