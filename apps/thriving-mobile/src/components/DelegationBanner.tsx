// ═══════════════════════════════════════════════════════════
// FILE: DelegationBanner.tsx
// PURPOSE: Shows a subtle banner at the top of every screen when
//   the user is working in someone else's account. Displays whose
//   account they're viewing and a link to switch back.
// CALLED BY: app/(app)/layout.tsx
// DATA FLOW: Reads acting_as_name cookie on the server → if set,
//   renders the banner with the owner's name and a switch link
// ═══════════════════════════════════════════════════════════
import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';

/**
 * Triggered by: app layout renders this on every authenticated page.
 * Steps: reads the acting_as_name cookie. If not set, renders nothing
 *   (the user is on their own account). If set, renders a colored
 *   banner showing whose account they're viewing with a link to
 *   switch accounts.
 * Returns: the banner element or null.
 */
export default async function DelegationBanner(): Promise<React.JSX.Element | null> {
  const cookieStore = await cookies();
  const ownerName = cookieStore.get('acting_as_name')?.value;

  // Not acting as anyone → don't render
  if (!ownerName) return null;

  return (
    <div
      className="flex items-center justify-between px-4 py-2 text-xs"
      style={{
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        color: 'var(--accent)',
        paddingTop: 'env(safe-area-inset-top, 4px)',
      }}
    >
      <span className="font-medium">
        Viewing {ownerName}&apos;s account
      </span>
      <Link
        href="/choose-account"
        className="underline font-medium"
        style={{ color: 'var(--accent)' }}
      >
        Switch
      </Link>
    </div>
  );
}
