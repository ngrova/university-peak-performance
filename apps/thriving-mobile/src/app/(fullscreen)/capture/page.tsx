// ═══════════════════════════════════════════════════════════
// FILE: page.tsx (capture — fullscreen)
// PURPOSE: The capture page — a full-screen experience for
//   recording voice, snapping photos, AI processing, and adding
//   tasks. No tab bar, no overlays. Replaces the old bottom sheet.
// CALLED BY: Next.js framework (automatic — this is the /capture route)
// DATA FLOW: User navigates to /capture → page renders
//   CapturePageContent → all capture components mount
// ═══════════════════════════════════════════════════════════
import React from 'react';
import CapturePageContent from '@/components/CapturePageContent';

/**
 * Triggered by: user taps the + button on the tab bar or FAB.
 * Steps: renders the CapturePageContent client component which
 *   handles voice recording, camera, AI processing, and task form.
 * Returns: the full-screen capture page.
 */
export default function CapturePage(): React.JSX.Element {
  return <CapturePageContent />;
}
