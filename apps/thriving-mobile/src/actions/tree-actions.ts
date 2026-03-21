// ═══════════════════════════════════════════════════════════
// FILE: tree-actions.ts
// PURPOSE: Fetches all data for the Domino Tree screen in one
//   call — pillars, goals, and tasks. The client-side hook then
//   filters and builds chains from this data as the user drills.
// CALLED BY: hooks/use-tree-drilldown.ts
// DATA FLOW: Hook calls this → server checks auth → @upp/db
//   getTreeData queries Supabase for all 3 tables → returns
//   { data: TreeData } or { error: string }
// ═══════════════════════════════════════════════════════════
'use server';

import { getTreeData } from '@upp/db';
import type { TreeData } from '@upp/db';
import { getServerClient } from '@/lib/supabase-server';
import { getActingAsUserId } from '@/lib/get-acting-as';

/**
 * Triggered by: Tree screen mounts (hook calls this once).
 * Steps: gets the logged-in user, fetches all pillars + goals +
 *   tasks in one call via getTreeData, returns the full dataset.
 * Returns: { data: TreeData } on success, { error } if auth
 *   fails or the query breaks.
 */
export async function fetchTreeData(): Promise<{ data: TreeData } | { error: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Session expired — please log in again' };
    const targetUserId = await getActingAsUserId(supabase, user.id);
    const data = await getTreeData(supabase, targetUserId);
    return { data };
  } catch {
    return { error: 'Failed to load tree — try again' };
  }
}
