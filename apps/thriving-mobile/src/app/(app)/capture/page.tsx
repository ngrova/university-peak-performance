// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (capture)
// PURPOSE: Safety redirect — if someone navigates to /capture
//   directly, sends them to /today. The actual capture UI is a
//   bottom sheet (CaptureSheet.tsx), not a standalone page.
// CALLED BY: Next.js framework (automatic — this is the /capture route)
// DATA FLOW: Browser hits "/capture" → redirects to "/today"
// ═══════════════════════════════════════════════════════════
import { redirect } from 'next/navigation';

/**
 * Triggered by: direct navigation to /capture URL.
 * Steps: immediately redirects to /today because capture is a
 *   bottom sheet overlay, not its own page.
 * Returns: never returns — the redirect throws internally.
 */
export default function CapturePage(): never {
  redirect('/today');
}
