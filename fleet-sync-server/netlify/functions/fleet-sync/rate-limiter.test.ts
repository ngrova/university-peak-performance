import { describe, it, expect } from 'vitest'
import { checkRateLimit } from './rate-limiter'

describe('checkRateLimit', () => {
  it('allows first write', () => {
    const result = checkRateLimit('agent-test-unique-1')
    expect(result.allowed).toBe(true)
  })

  it('allows up to 20 writes', () => {
    const id = 'agent-test-unique-2'
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(id).allowed).toBe(true)
    }
  })

  it('blocks the 21st write', () => {
    const id = 'agent-test-unique-3'
    for (let i = 0; i < 20; i++) {
      checkRateLimit(id)
    }
    const result = checkRateLimit(id)
    expect(result.allowed).toBe(false)
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0)
    }
  })

  it('tracks agents independently', () => {
    const id1 = 'agent-test-unique-4'
    const id2 = 'agent-test-unique-5'
    for (let i = 0; i < 20; i++) {
      checkRateLimit(id1)
    }
    expect(checkRateLimit(id1).allowed).toBe(false)
    expect(checkRateLimit(id2).allowed).toBe(true)
  })
})
