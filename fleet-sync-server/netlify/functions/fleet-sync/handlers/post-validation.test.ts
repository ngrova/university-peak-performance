import { describe, it, expect } from 'vitest'
import { validatePost, VALID_KINDS, DIRECTED_KINDS } from './post-validation'

describe('validatePost', () => {
  const valid = { kind: 'progress', summary: 'Test summary' }

  it('returns null for a valid post', () => {
    expect(validatePost(valid)).toBeNull()
  })

  it('rejects missing kind', () => {
    expect(validatePost({ kind: '', summary: 'x' })).toContain('kind')
  })

  it('rejects missing summary', () => {
    expect(validatePost({ kind: 'progress', summary: '' })).toContain('summary')
  })

  it('rejects invalid kind', () => {
    expect(validatePost({ kind: 'invalid', summary: 'x' })).toContain('kind')
  })

  it('rejects summary over 200 chars', () => {
    expect(validatePost({ kind: 'progress', summary: 'x'.repeat(201) })).toContain('200')
  })

  it('rejects body over 4000 chars', () => {
    const result = validatePost({ ...valid, body: 'x'.repeat(4001) })
    expect(result).toContain('4000')
  })

  it('accepts valid body within limit', () => {
    expect(validatePost({ ...valid, body: 'x'.repeat(4000) })).toBeNull()
  })

  it('requires to_agent and urgency for directed kinds', () => {
    for (const kind of DIRECTED_KINDS) {
      expect(validatePost({ kind, summary: 'x' })).toContain('to_agent')
    }
  })

  it('accepts directed kind with to_agent and urgency', () => {
    const result = validatePost({
      kind: 'question', summary: 'x', to_agent: 'a', urgency: 'now',
    })
    expect(result).toBeNull()
  })

  it('prefixes error with index when provided', () => {
    const result = validatePost({ kind: '', summary: '' }, 3)
    expect(result).toContain('Post [3]')
  })

  it('exports all expected kinds', () => {
    expect(VALID_KINDS.length).toBe(9)
    expect(DIRECTED_KINDS.length).toBe(4)
  })
})
