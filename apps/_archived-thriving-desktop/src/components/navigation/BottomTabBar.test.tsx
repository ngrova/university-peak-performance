import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BottomTabBar from './BottomTabBar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/one-thing',
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@upp/db', () => ({
  createBrowserClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}))

describe('BottomTabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all three primary tabs', () => {
    render(<BottomTabBar />)
    expect(screen.getByText('Focus')).toBeTruthy()
    expect(screen.getByText('Tasks')).toBeTruthy()
    expect(screen.getByText('Map')).toBeTruthy()
    expect(screen.getByText('More')).toBeTruthy()
  })

  it('highlights active tab based on pathname', () => {
    render(<BottomTabBar />)
    const focusLink = screen.getByText('Focus').closest('a')
    expect(focusLink?.className).toContain('text-amber-400')
  })

  it('opens More sheet on tap', () => {
    render(<BottomTabBar />)
    expect(screen.queryByText('📊 Dashboard')).toBeNull()
    fireEvent.click(screen.getByText('More'))
    expect(screen.getByText('📊 Dashboard')).toBeTruthy()
    expect(screen.getByText('📅 Deadlines')).toBeTruthy()
    expect(screen.getByText('📈 Scorecard')).toBeTruthy()
  })

  it('closes More sheet on overlay click', () => {
    render(<BottomTabBar />)
    fireEvent.click(screen.getByText('More'))
    expect(screen.getByText('📊 Dashboard')).toBeTruthy()
    const overlay = document.querySelector('.bg-black\\/40')
    if (overlay) fireEvent.click(overlay)
    expect(screen.queryByText('📊 Dashboard')).toBeNull()
  })

  it('links to correct routes', () => {
    render(<BottomTabBar />)
    expect(screen.getByText('Focus').closest('a')?.getAttribute('href')).toBe('/one-thing')
    expect(screen.getByText('Tasks').closest('a')?.getAttribute('href')).toBe('/views/queue')
    expect(screen.getByText('Map').closest('a')?.getAttribute('href')).toBe('/views/tree')
  })
})
