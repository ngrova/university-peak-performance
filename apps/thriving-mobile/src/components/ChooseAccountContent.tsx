// ═══════════════════════════════════════════════════════════
// FILE: ChooseAccountContent.tsx
// PURPOSE: The interactive account picker shown after login when
//   the user has delegations. Shows "My account" and one button
//   per delegated account. Sets the acting_as cookie and redirects.
// CALLED BY: app/(auth)/choose-account/page.tsx
// DATA FLOW: User taps a button → selectAccount or clearActingAs
//   server action sets cookie → client navigates to /today
// ═══════════════════════════════════════════════════════════
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { selectAccount, clearActingAs } from '@/actions/delegation-actions';

interface Delegation {
  id: string;
  owner_id: string;
  owner_name: string;
}

interface Props {
  delegations: Delegation[];
}

/**
 * Triggered by: choose-account page renders this when delegations exist.
 * Steps: shows a card for "My account" and one card per delegated owner.
 *   When the user taps a card, calls the appropriate server action to
 *   set or clear the acting_as cookie, then navigates to /today.
 * Returns: the account picker UI.
 */
export default function ChooseAccountContent({ delegations }: Props): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selects the user's own account (clears any existing delegation)
  async function handleMyAccount(): Promise<void> {
    setLoading(true);
    setError(null);
    const result = await clearActingAs();
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    queryClient.clear();
    router.push('/today');
  }

  // Selects a delegated owner's account
  async function handleOwnerAccount(ownerId: string, ownerName: string): Promise<void> {
    setLoading(true);
    setError(null);
    const result = await selectAccount(ownerId, ownerName);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    queryClient.clear();
    router.push('/today');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div
        className="w-full max-w-sm rounded-xl p-6"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <h1 className="text-xl font-bold text-center mb-1" style={{ color: 'var(--text-primary)' }}>
          Whose account?
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          Pick which account to work in
        </p>

        <div className="space-y-3">
          <button
            onClick={handleMyAccount}
            disabled={loading}
            className="w-full rounded-lg p-4 text-left transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              My account
            </span>
            <span className="block text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Your own pillars, goals, and tasks
            </span>
          </button>

          {delegations.map((d) => (
            <button
              key={d.id}
              onClick={() => handleOwnerAccount(d.owner_id, d.owner_name)}
              disabled={loading}
              className="w-full rounded-lg p-4 text-left transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--bg-elevated)', borderLeft: '4px solid var(--accent)' }}
            >
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {d.owner_name}
              </span>
              <span className="block text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Work in their account as an assistant
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p
            className="text-sm px-3 py-2 rounded-lg mt-4"
            style={{ color: 'var(--danger)', backgroundColor: 'rgba(232,72,72,0.1)' }}
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
