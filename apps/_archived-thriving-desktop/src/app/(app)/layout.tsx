import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@upp/db'
import Sidebar from '@/components/sidebar/Sidebar'
import BottomTabBar from '@/components/navigation/BottomTabBar'

interface AppLayoutProps {
  children: React.ReactNode
}

// Server Component — validates auth session before rendering any /(app)/* page
export default async function AppLayout({ children }: AppLayoutProps): Promise<React.JSX.Element> {
  const cookieStore = await cookies()

  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content — extra bottom padding on mobile for tab bar */}
      <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom tab bar — hidden on desktop */}
      <div className="md:hidden">
        <BottomTabBar />
      </div>
    </div>
  )
}
