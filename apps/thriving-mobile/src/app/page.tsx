// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (root)
// PURPOSE: When someone opens the app at "/", this immediately
//   sends them to the Today tab. It's just a redirect — no UI.
// CALLED BY: Next.js framework (automatic — this is the "/" route)
// DATA FLOW: Browser hits "/" → this redirects to "/today"
// ═══════════════════════════════════════════════════════════
import { redirect } from 'next/navigation';

/**
 * Triggered by: user navigates to the root URL "/".
 * Steps: immediately redirects to /today (the default tab).
 * Returns: never returns — the redirect throws internally.
 */
export default function RootPage(): never {
  redirect('/today');
}
