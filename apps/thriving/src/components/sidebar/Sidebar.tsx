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
    const base = 'block px-3 py-2 rounded text-sm font-medium transition-colors'
    return pathname === href
      ? `${base} bg-slate-700 text-white`
      : `${base} text-slate-300 hover:bg-slate-700 hover:text-white`
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-slate-900 flex flex-col h-full">
      <div className="px-4 py-5 border-b border-slate-700">
        <span className="text-white font-bold text-lg">🌱 Thriving</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link href="/dashboard" className={navClass('/dashboard')}>
          📊 Dashboard
        </Link>
        <Link href="/settings" className={navClass('/settings')}>
          ⚙️ Settings
        </Link>
      </nav>
      <div className="px-2 py-4 border-t border-slate-700">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 rounded text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          🚪 Sign out
        </button>
      </div>
    </aside>
  )
}
