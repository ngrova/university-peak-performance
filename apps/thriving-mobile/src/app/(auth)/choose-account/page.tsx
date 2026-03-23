// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (choose-account)
// PURPOSE: After login, checks if the user has any delegations.
//   If none, redirects straight to /today (zero flash). If the
//   user is an assistant for one or more accounts, shows a picker
//   so they can choose whose data to work in.
// CALLED BY: Next.js framework (automatic — /choose-account route);
//   login/page.tsx and signup/page.tsx redirect here after auth
// DATA FLOW: Server checks auth → queries delegations → if none,
//   redirect to /today; if some, render ChooseAccountContent
// ═══════════════════════════════════════════════════════════
import React from 'react';
import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/supabase-server';
import ChooseAccountContent from '@/components/ChooseAccountContent';

interface DelegationWithName {
  id: string;
  owner_id: string;
  owner_name: string;
}

// Hardcoded for now — replaced by a profiles table when the invite flow is built
const OWNER_NAMES: Record<string, string> = {
  'a0a9ed26-9394-4c94-8d57-e5ffe7f4f3c2': 'Nick Grover',
};
const DEFAULT_OWNER_NAME = 'Shared account';

/**
 * Triggered by: login/signup redirects here, or user navigates directly.
 * Steps: verifies the user is logged in, queries delegations where
 *   they are the assistant. If no delegations, redirects to /today
 *   instantly (server-side, no flash). If delegations exist, renders
 *   the account picker with owner names.
 * Returns: either a redirect or the picker UI.
 */
export default async function ChooseAccountPage(): Promise<React.JSX.Element> {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: delegations } = await supabase
    .from('delegations')
    .select('id, owner_id')
    .eq('assistant_id', user.id)
    .limit(10);

  // No delegations → skip picker, go straight to the app
  if (!delegations?.length) redirect('/today');

  // Resolve display names (hardcoded map, falls back to generic label)
  const withNames: DelegationWithName[] = delegations.map((d) => ({
    ...d,
    owner_name: OWNER_NAMES[d.owner_id] ?? DEFAULT_OWNER_NAME,
  }));

  return <ChooseAccountContent delegations={withNames} />;
}
