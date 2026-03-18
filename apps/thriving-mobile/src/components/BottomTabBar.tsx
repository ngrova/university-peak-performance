'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, ListChecks, PlusCircle, Target, GitBranch, type LucideIcon } from 'lucide-react';

interface TabDef {
  href: string;
  label: string;
  Icon: LucideIcon;
  isCenter?: boolean;
}

const TABS: readonly TabDef[] = [
  { href: '/today', label: 'Today', Icon: Sun },
  { href: '/tasks', label: 'Tasks', Icon: ListChecks },
  { href: '/capture', label: 'Capture', Icon: PlusCircle, isCenter: true },
  { href: '/goals', label: 'Goals', Icon: Target },
  { href: '/tree', label: 'Tree', Icon: GitBranch },
];

/** Fixed bottom tab bar with 5 tabs and safe-area padding */
export default function BottomTabBar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-end justify-around"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        height: `calc(var(--tab-bar-height) + env(safe-area-inset-bottom))`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(({ href, label, Icon, isCenter }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className="flex flex-col items-center justify-center"
            style={{
              height: 'var(--tab-bar-height)',
              minWidth: '64px',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            <Icon
              size={isCenter ? 32 : 24}
              strokeWidth={active ? 2.2 : 1.5}
              fill={active && !isCenter ? 'currentColor' : 'none'}
              style={isCenter ? { color: 'var(--accent)' } : undefined}
            />
            {active && !isCenter && (
              <span className="text-xs mt-0.5 font-semibold">{label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
