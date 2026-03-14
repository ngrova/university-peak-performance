import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard',
}))

vi.mock('@upp/db', () => ({
  createBrowserClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

import Sidebar from './Sidebar'

describe('Sidebar', () => {
  it('renders the Thriving logo', () => {
    render(<Sidebar />)
    expect(screen.getByText(/thriving/i)).toBeDefined()
  })

  it('renders Dashboard nav link', () => {
    render(<Sidebar />)
    const link = screen.getByRole('link', { name: /dashboard/i })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/dashboard')
  })

  it('renders Settings nav link', () => {
    render(<Sidebar />)
    const link = screen.getByRole('link', { name: /settings/i })
    expect(link).toBeDefined()
  })

  it('renders sign out button', () => {
    render(<Sidebar />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeDefined()
  })
})
