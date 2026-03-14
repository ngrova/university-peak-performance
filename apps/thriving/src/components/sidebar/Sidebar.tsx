'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@upp/db'

export default function Sidebar(): React.JSX.Element {
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function navClass(href: string) {
    const base = 'block px-3 py-2 rounded-lg text-sm font-medium transition-colors'
    return pathname === href
      ? `${base} text-amber-400`
      : `${base} text-stone-400 hover:text-stone-100 hover:bg-white/5`
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full" style={{ backgroundColor: '#2D2318' }}>
      <div className="px-4 py-5 border-b border-white/10">
        <span
          className="font-bold italic text-lg"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#FAF7F2' }}
        >
          🌱 Thriving
        </span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link href="/dashboard" className={navClass('/dashboard')}>
          📊 Dashboard
        </Link>
        <div className="pt-2">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: '#9B8E80' }}>
            Views
          </p>
          <Link href="/one-thing" className={navClass('/one-thing')}>🎯 One Thing</Link>
          <Link href="/views/deadlines" className={navClass('/views/deadlines')}>📅 Deadlines</Link>
          <Link href="/views/queue" className={navClass('/views/queue')}>📋 Queue</Link>
          <Link href="/views/tree" className={navClass('/views/tree')}>🌲 Tree</Link>
        </div>
        <Link href="/scorecard" className={navClass('/scorecard')}>📊 Scorecard</Link>
        <Link href="/settings" className={navClass('/settings')}>⚙️ Settings</Link>
      </nav>
      <div className="px-2 py-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
          style={{ color: '#9B8E80' }}
        >
          🚪 Sign out
        </button>
      </div>
    </aside>
  )
}
