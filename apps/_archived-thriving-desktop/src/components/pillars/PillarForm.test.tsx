import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/actions/pillar-actions', () => ({
  createPillarAction: vi.fn(),
  updatePillarAction: vi.fn(),
}))

import PillarForm from './PillarForm'

describe('PillarForm', () => {
  it('renders name, icon, and color fields', () => {
    render(<PillarForm onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/name/i)).toBeDefined()
    expect(screen.getByLabelText(/icon/i)).toBeDefined()
    expect(screen.getByLabelText(/color/i)).toBeDefined()
  })

  it('renders Create button when no pillar prop', () => {
    render(<PillarForm onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /create/i })).toBeDefined()
  })

  it('renders Save button when editing an existing pillar', () => {
    const pillar = {
      id: '1',
      user_id: 'u1',
      name: 'Health',
      icon: '💪',
      color: '#ff0000',
      sort_order: 0,
      is_archived: false,
      created_at: '',
      updated_at: '',
    }
    render(<PillarForm pillar={pillar} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeDefined()
  })

  it('renders Cancel button', () => {
    render(<PillarForm onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined()
  })
})
