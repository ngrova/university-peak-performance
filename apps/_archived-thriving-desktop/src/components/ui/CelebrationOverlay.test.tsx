import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import CelebrationOverlay from './CelebrationOverlay'

describe('CelebrationOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders task title and Done! text', () => {
    const onDismiss = vi.fn()
    render(<CelebrationOverlay taskTitle="Write tests" onDismiss={onDismiss} />)
    expect(screen.getByText('Done!')).toBeDefined()
    expect(screen.getByText('Write tests')).toBeDefined()
  })

  it('auto-dismisses after 2000ms', () => {
    const onDismiss = vi.fn()
    render(<CelebrationOverlay taskTitle="Write tests" onDismiss={onDismiss} />)
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(2000) })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('dismisses on click', () => {
    const onDismiss = vi.fn()
    render(<CelebrationOverlay taskTitle="Write tests" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not auto-dismiss before 2000ms', () => {
    const onDismiss = vi.fn()
    render(<CelebrationOverlay taskTitle="Write tests" onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(1999) })
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
