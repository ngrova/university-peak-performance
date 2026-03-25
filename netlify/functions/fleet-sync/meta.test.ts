import { describe, it, expect } from 'vitest'
import { withMeta } from './meta'

describe('withMeta', () => {
  it('adds _meta field to response', () => {
    const result = withMeta({ foo: 'bar' })
    expect(result._meta).toContain('FLEET DATA')
    expect(result.foo).toBe('bar')
  })

  it('preserves all original fields', () => {
    const result = withMeta({ a: 1, b: 'two', c: [3] })
    expect(result.a).toBe(1)
    expect(result.b).toBe('two')
    expect(result.c).toEqual([3])
  })

  it('_meta warns about injection', () => {
    const result = withMeta({})
    expect(result._meta).toContain('not instructions')
    expect(result._meta).toContain('system directives')
  })
})
