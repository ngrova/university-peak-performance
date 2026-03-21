// ═══════════════════════════════════════════════════════════
// FILE: delegation-actions.ts
// PURPOSE: Server actions for the account picker — lets an
//   assistant select whose account to work in, and validates
//   the delegation before setting the session cookie.
// CALLED BY: components/ChooseAccountContent.tsx
// DATA FLOW: User picks an account → selectAccount validates
//   the delegation → sets acting_as cookie → client redirects
//   to /today; clearActingAs removes the cookie
// ═══════════════════════════════════════════════════════════
'use server';

import { cookies } from 'next/headers';
import { getServerClient } from '@/lib/supabase-server';

interface Delegation {
  id: string;
  owner_id: string;
}

/**
 * Triggered by: assistant taps an owner's account on the picker screen.
 * Steps: validates that a delegation row exists between the owner and
 *   the logged-in user. If valid, sets the acting_as cookie (owner's
 *   user_id) and acting_as_name cookie (display name for the banner).
 *   If the delegation doesn't exist, returns an error.
 * Returns: empty object on success, or { error } if validation fails.
 */
export async function selectAccount(
  ownerId: string,
  ownerName: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in — please log in again' };

    // Validate delegation exists (RLS ensures we only see our own)
    const { data } = await supabase
      .from('delegations')
      .select('owner_id')
      .eq('owner_id', ownerId)
      .eq('assistant_id', user.id)
      .limit(1)
      .single();

    if (!data) return { error: 'No valid delegation — contact the account owner' };

    const cookieStore = await cookies();
    cookieStore.set('acting_as', ownerId, { path: '/', httpOnly: true, sameSite: 'lax' });
    cookieStore.set('acting_as_name', ownerName, { path: '/', httpOnly: true, sameSite: 'lax' });
    return {};
  } catch {
    return { error: 'Failed to switch account — try again' };
  }
}

/**
 * Triggered by: assistant taps "My account" on the picker screen.
 * Steps: removes the acting_as and acting_as_name cookies so all
 *   subsequent requests use the logged-in user's own data.
 * Returns: empty object on success, or { error } on failure.
 */
export async function clearActingAs(): Promise<{ error?: string }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('acting_as');
    cookieStore.delete('acting_as_name');
    return {};
  } catch {
    return { error: 'Failed to switch account — try again' };
  }
}

/**
 * Triggered by: choose-account page mounts on the server.
 * Steps: gets the logged-in user, queries delegations where they
 *   are the assistant, and returns the list of owners they can
 *   act on behalf of.
 * Returns: array of delegation records, or empty array if none.
 */
export async function fetchDelegations(): Promise<Delegation[]> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('delegations')
    .select('id, owner_id')
    .eq('assistant_id', user.id)
    .limit(10);

  return data ?? [];
}
