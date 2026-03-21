// ═══════════════════════════════════════════════════════════
// FILE: get-acting-as.ts
// PURPOSE: The single source of truth for "whose data should this
//   request operate on?" If an assistant has picked an owner's
//   account, returns the owner's user_id. Otherwise returns the
//   logged-in user's own ID. Validates the delegation exists on
//   every call — a revoked delegation immediately takes effect.
// CALLED BY: actions/today-actions.ts, actions/task-actions.ts,
//   actions/goal-actions.ts, actions/goals-page-actions.ts,
//   actions/tasks-page-actions.ts, actions/tree-actions.ts
// DATA FLOW: acting_as cookie → validate against delegations table
//   → return verified owner_id or fall back to auth user_id
// ═══════════════════════════════════════════════════════════
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Triggered by: every server action that fetches or creates data.
 * Steps: reads the acting_as cookie. If set, queries the delegations
 *   table to confirm the logged-in user is a valid assistant for that
 *   owner. If the delegation is valid, returns the owner's ID so data
 *   queries operate on the owner's account. If no cookie or invalid
 *   delegation, returns the logged-in user's own ID.
 * Returns: the user_id to use for all data queries in this request.
 */
export async function getActingAsUserId(
  supabase: SupabaseClient,
  authUserId: string,
): Promise<string> {
  const cookieStore = await cookies();
  const actingAs = cookieStore.get('acting_as')?.value;

  // No cookie → use own account
  if (!actingAs) return authUserId;

  // Cookie matches own ID → no delegation needed
  if (actingAs === authUserId) return authUserId;

  // Validate delegation exists (RLS ensures we only see our own delegations)
  const { data } = await supabase
    .from('delegations')
    .select('owner_id')
    .eq('owner_id', actingAs)
    .eq('assistant_id', authUserId)
    .limit(1)
    .single();

  // Valid delegation → use owner's ID; invalid → fall back to own account
  return data ? data.owner_id : authUserId;
}
