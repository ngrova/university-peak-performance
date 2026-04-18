// ═══════════════════════════════════════════════════════════
// FILE: layout.tsx (root)
// PURPOSE: The outermost shell of the entire app. Sets the page
//   title, PWA settings (so it works like a native app), dark
//   theme color, and wraps everything in the Providers component.
// CALLED BY: Next.js framework (automatic — this is the root layout)
// DATA FLOW: Next.js renders this first → wraps all pages in
//   <html>/<body> with Providers → child routes render inside
// ═══════════════════════════════════════════════════════════
import React from 'react';
import type { Metadata, Viewport } from 'next';
import * as Sentry from '@sentry/nextjs';
import { Providers } from './providers';
import './globals.css';

export function generateMetadata(): Metadata {
  return {
    title: 'Thriving',
    description: 'Your daily driver for goals, tasks, and life pillars.',
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Thriving',
    },
    other: {
      'mobile-web-app-capable': 'yes',
      ...Sentry.getTraceData(),
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0A0F',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Triggered by: Next.js renders this automatically for every page.
 * Steps: sets <html> lang, adds an Apple touch icon in <head>,
 *   applies the antialiased font class to <body>, and nests the
 *   Providers component (which sets up TanStack Query).
 * Returns: the root HTML document wrapping all page content.
 */
export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
