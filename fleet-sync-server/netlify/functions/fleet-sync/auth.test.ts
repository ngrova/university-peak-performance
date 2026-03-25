import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isAuthorized } from './auth'

describe('isAuthorized', () => {
  beforeEach(() => {
    vi.stubEnv('FLEET_API_KEY', 'test-secret-key')
  })

  it('rejects request with no auth header', () => {
    const req = new Request('http://localhost', { method: 'POST' })
    expect(isAuthorized(req)).toBe(false)
  })

  it('rejects request with wrong scheme', () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { Authorization: 'Basic test-secret-key' },
    })
    expect(isAuthorized(req)).toBe(false)
  })

  it('rejects request with wrong key', () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { Authorization: 'Bearer wrong-key' },
    })
    expect(isAuthorized(req)).toBe(false)
  })

  it('accepts request with correct key', () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { Authorization: 'Bearer test-secret-key' },
    })
    expect(isAuthorized(req)).toBe(true)
  })

  it('allows all requests when FLEET_API_KEY is not set (open mode)', () => {
    vi.stubEnv('FLEET_API_KEY', '')
    const req = new Request('http://localhost', { method: 'POST' })
    expect(isAuthorized(req)).toBe(true)
  })
})
