import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/actions/goal-actions', () => ({
  deleteGoalAction: vi.fn(),
  createGoalAction: vi.fn(),
  updateGoalAction: vi.fn(),
}))

import GoalCard from './GoalCard'

const goal = {
  id: 'g1',
  user_id: 'u1',
  pillar_id: 'p1',
  title: 'Run a marathon',
  description: 'Complete 26.2 miles by year end',
  target_date: '2024-12-31',
  status: 'active' as const,
  sort_order: 0,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

describe('GoalCard', () => {
  it('renders goal title', () => {
    render(<GoalCard goal={goal} pillarId="p1" />)
    expect(screen.getByText('Run a marathon')).toBeDefined()
  })

  it('renders goal description', () => {
    render(<GoalCard goal={goal} pillarId="p1" />)
    expect(screen.getByText('Complete 26.2 miles by year end')).toBeDefined()
  })

  it('renders status badge', () => {
    render(<GoalCard goal={goal} pillarId="p1" />)
    expect(screen.getByText('active')).toBeDefined()
  })

  it('renders Edit and Delete buttons', () => {
    render(<GoalCard goal={goal} pillarId="p1" />)
    expect(screen.getByRole('button', { name: /edit/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /delete/i })).toBeDefined()
  })
})
