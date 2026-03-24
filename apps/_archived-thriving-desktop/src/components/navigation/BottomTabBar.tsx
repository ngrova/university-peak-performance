'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@upp/db'

const TABS = [
  { href: '/one-thing', icon: '★', label: 'Focus' },
  { href: '/views/queue', icon: '☐', label: 'Tasks' },
  { href: '/views/tree', icon: '🌳', label: 'Map' },
] as const

const MORE_LINKS = [
  { href: '/dashboard', label: '📊 Dashboard' },
  { href: '/views/deadlines', label: '📅 Deadlines' },
  { href: '/scorecard', label: '📈 Scorecard' },
  { href: '/settings', label: '⚙️ Settings' },
]

export default function BottomTabBar(): React.JSX.Element {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? 'dev'

  async function handleSignOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function tabClass(href: string) {
    const active = pathname === href
    return `flex flex-col items-center gap-0.5 px-4 py-2 text-xs font-medium transition-colors ${active ? 'text-amber-400' : 'text-stone-400'}`
  }

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMoreOpen(false)} />
      )}
      {moreOpen && (
        <div
          className="fixed bottom-16 left-0 right-0 z-50 rounded-t-2xl border-t border-white/10 shadow-2xl"
          style={{ backgroundColor: '#2D2318' }}
        >
          <div className="px-4 py-3 space-y-1">
            {MORE_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className="block px-3 py-3 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/5 transition-colors"
              >
                {label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: '#9B8E80' }}
            >
              🚪 Sign out
            </button>
            <p className="px-3 pt-1 text-xs" style={{ color: '#4B4540' }}>v{sha}</p>
          </div>
        </div>
      )}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-white/10"
        style={{ backgroundColor: '#2D2318' }}
      >
        {TABS.map(({ href, icon, label }) => (
          <Link key={href} href={href} className={tabClass(href)}>
            <span className="text-lg leading-none">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
        <button
          onClick={() => setMoreOpen((o) => !o)}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs font-medium transition-colors ${moreOpen ? 'text-amber-400' : 'text-stone-400'}`}
        >
          <span className="text-lg leading-none">≡</span>
          <span>More</span>
        </button>
      </nav>
    </>
  )
}
