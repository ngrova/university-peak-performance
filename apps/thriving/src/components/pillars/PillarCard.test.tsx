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

const basePillar = {
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

function makePillar(overrides: { goalCount: number; taskCount: number; completedTaskCount: number }) {
  return { ...basePillar, ...overrides }
}

describe('PillarCard', () => {
  it('renders pillar name', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 0, taskCount: 0, completedTaskCount: 0 })} />)
    expect(screen.getByText('Health & Fitness')).toBeDefined()
  })

  it('renders pillar icon', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 0, taskCount: 0, completedTaskCount: 0 })} />)
    expect(screen.getByText('💪')).toBeDefined()
  })

  it('renders color indicator', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 0, taskCount: 0, completedTaskCount: 0 })} />)
    expect(screen.getByLabelText(/color/i)).toBeDefined()
  })

  it('renders View Goals link', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 1, taskCount: 2, completedTaskCount: 1 })} />)
    const link = screen.getByRole('link', { name: /view goals/i })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/pillars/p1')
  })

  it('renders Edit and Delete buttons', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 0, taskCount: 0, completedTaskCount: 0 })} />)
    expect(screen.getByRole('button', { name: /edit/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /delete/i })).toBeDefined()
  })

  it('shows "No goals yet" when goalCount is 0', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 0, taskCount: 0, completedTaskCount: 0 })} />)
    expect(screen.getByText(/no goals yet/i)).toBeDefined()
  })

  it('shows goal count', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 3, taskCount: 5, completedTaskCount: 2 })} />)
    expect(screen.getByText('3 goals')).toBeDefined()
  })

  it('shows singular "goal" for goalCount of 1', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 1, taskCount: 2, completedTaskCount: 0 })} />)
    expect(screen.getByText('1 goal')).toBeDefined()
  })

  it('shows task fraction when tasks exist', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 2, taskCount: 10, completedTaskCount: 4 })} />)
    expect(screen.getByText('4/10 tasks')).toBeDefined()
  })

  it('shows completion indicator when all tasks done', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 1, taskCount: 3, completedTaskCount: 3 })} />)
    expect(screen.getByText(/all done/i)).toBeDefined()
  })

  it('shows progress bar when tasks exist', () => {
    render(<PillarCard pillar={makePillar({ goalCount: 1, taskCount: 4, completedTaskCount: 2 })} />)
    expect(screen.getByRole('progressbar')).toBeDefined()
  })
})
