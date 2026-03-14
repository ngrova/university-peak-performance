import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

vi.mock('@/actions/pillar-actions', () => ({
  deletePillarAction: vi.fn(),
  createPillarAction: vi.fn(),
  updatePillarAction: vi.fn(),
}))

import PillarCard from './PillarCard'

const pillar = {
  id: 'p1',
  user_id: 'u1',
  name: 'Health & Fitness',
  icon: '💪',
  color: '#22c55e',
  sort_order: 0,
  is_archived: false,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

describe('PillarCard', () => {
  it('renders pillar name', () => {
    render(<PillarCard pillar={pillar} />)
    expect(screen.getByText('Health & Fitness')).toBeDefined()
  })

  it('renders pillar icon', () => {
    render(<PillarCard pillar={pillar} />)
    expect(screen.getByText('💪')).toBeDefined()
  })

  it('renders color indicator', () => {
    render(<PillarCard pillar={pillar} />)
    expect(screen.getByLabelText(/color/i)).toBeDefined()
  })

  it('renders View Goals link', () => {
    render(<PillarCard pillar={pillar} />)
    const link = screen.getByRole('link', { name: /view goals/i })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/pillars/p1')
  })

  it('renders Edit and Delete buttons', () => {
    render(<PillarCard pillar={pillar} />)
    expect(screen.getByRole('button', { name: /edit/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /delete/i })).toBeDefined()
  })
})
