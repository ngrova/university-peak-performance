import { describe, it, expect } from 'vitest'
import { requireString, checkLength, checkEnum } from './validation'

describe('requireString', () => {
  it('returns null for valid string', () => {
    expect(requireString('hello', 'field')).toBeNull()
  })
  it('rejects empty string', () => {
    expect(requireString('', 'field')).toContain('field')
  })
  it('rejects whitespace-only string', () => {
    expect(requireString('   ', 'field')).toContain('field')
  })
  it('rejects non-string values', () => {
    expect(requireString(42, 'field')).toContain('field')
    expect(requireString(null, 'field')).toContain('field')
    expect(requireString(undefined, 'field')).toContain('field')
  })
})

describe('checkLength', () => {
  it('returns null when within limit', () => {
    expect(checkLength('short', 'field', 200)).toBeNull()
  })
  it('returns null at exact limit', () => {
    expect(checkLength('x'.repeat(200), 'field', 200)).toBeNull()
  })
  it('rejects over limit', () => {
    const result = checkLength('x'.repeat(201), 'field', 200)
    expect(result).toContain('200')
    expect(result).toContain('201')
  })
})

describe('checkEnum', () => {
  const allowed = ['a', 'b', 'c'] as const
  it('returns null for valid value', () => {
    expect(checkEnum('a', 'field', allowed)).toBeNull()
  })
  it('rejects invalid value', () => {
    const result = checkEnum('d', 'field', allowed)
    expect(result).toContain('a, b, c')
  })
})
