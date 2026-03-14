import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}))

vi.mock('@upp/db', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1', email: 'test@example.com' } } }),
    },
  })),
  getPillars: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/components/pillars/PillarCard', () => ({
  default: () => <div data-testid="pillar-card" />,
}))

vi.mock('@/components/pillars/AddPillarButton', () => ({
  default: () => <button>+ Add Pillar</button>,
}))

import DashboardPage from './(app)/dashboard/page'

describe('DashboardPage', () => {
  it('renders the pillars heading', async () => {
    const element = await DashboardPage()
    render(element)
    expect(screen.getByRole('heading', { name: /my life pillars/i })).toBeInTheDocument()
  })

  it('shows empty state when no pillars', async () => {
    const element = await DashboardPage()
    render(element)
    expect(screen.getByText(/no pillars yet/i)).toBeInTheDocument()
  })
})
