import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/actions/goal-actions', () => ({
  createGoalAction: vi.fn(),
  updateGoalAction: vi.fn(),
}))

import GoalForm from './GoalForm'

describe('GoalForm', () => {
  it('renders title field', () => {
    render(<GoalForm pillarId="p1" onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/title/i)).toBeDefined()
  })

  it('renders description field', () => {
    render(<GoalForm pillarId="p1" onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/description/i)).toBeDefined()
  })

  it('renders target date field', () => {
    render(<GoalForm pillarId="p1" onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/target date/i)).toBeDefined()
  })

  it('renders Create button when no goal prop', () => {
    render(<GoalForm pillarId="p1" onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /create/i })).toBeDefined()
  })

  it('renders Save button when editing', () => {
    const goal = {
      id: 'g1',
      user_id: 'u1',
      pillar_id: 'p1',
      title: 'Run a marathon',
      description: null,
      target_date: null,
      status: 'active' as const,
      sort_order: 0,
      color: '#6366f1',
      priority_rank: 5,
      created_at: '',
      updated_at: '',
    }
    render(<GoalForm pillarId="p1" goal={goal} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeDefined()
  })

  it('renders Cancel button', () => {
    render(<GoalForm pillarId="p1" onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined()
  })
})
