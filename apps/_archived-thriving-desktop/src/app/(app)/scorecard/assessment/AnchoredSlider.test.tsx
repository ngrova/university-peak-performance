import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AnchoredSlider from './AnchoredSlider'
import { DOMAINS } from '@/lib/scorecard-constants'

const domain = DOMAINS[0]! // Physical Health

describe('AnchoredSlider', () => {
  it('renders the current value in the large score display', () => {
    render(<AnchoredSlider domain={domain} value={5.0} onChange={() => {}} />)
    // Value appears in the big display and thumb — at least one should be present
    expect(screen.getAllByText('5.0').length).toBeGreaterThanOrEqual(1)
  })

  it('renders all anchor labels in the track area', () => {
    render(<AnchoredSlider domain={domain} value={5.0} onChange={() => {}} />)
    // Each anchor label appears; some may appear twice (highlight + track label)
    for (const anchor of domain.anchors) {
      expect(screen.getAllByText(anchor.label).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('calls onChange when slider moves', () => {
    const onChange = vi.fn()
    render(<AnchoredSlider domain={domain} value={5.0} onChange={onChange} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '7' } })
    expect(onChange).toHaveBeenCalledWith(7)
  })

  it('snaps to anchor score when label is clicked', () => {
    const onChange = vi.fn()
    render(<AnchoredSlider domain={domain} value={5.0} onChange={onChange} />)
    // 'Thriving' only appears in anchor labels row (not the nearest-highlight at value=5)
    const btns = screen.getAllByText('Thriving')
    fireEvent.click(btns[0]!)
    expect(onChange).toHaveBeenCalledWith(9.0)
  })

  it('shows nearest anchor description', () => {
    render(<AnchoredSlider domain={domain} value={2.0} onChange={() => {}} />)
    expect(screen.getByText('Rarely move, eat poorly, low energy most days')).toBeInTheDocument()
  })
})
