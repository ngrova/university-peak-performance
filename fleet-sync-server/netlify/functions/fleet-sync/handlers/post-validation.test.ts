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

describe('validatePost — relay fields', () => {
  const valid = { kind: 'progress', summary: 'Test summary' }

  it('accepts all valid relay_type values', () => {
    for (const rt of ['board_post', 'desk_drop', 'office_visit', 'reply']) {
      expect(validatePost({ ...valid, relay_type: rt })).toBeNull()
    }
  })

  it('rejects invalid relay_type', () => {
    const result = validatePost({ ...valid, relay_type: 'carrier_pigeon' })
    expect(result).toContain('relay_type')
  })

  it('accepts null/omitted relay_type', () => {
    expect(validatePost(valid)).toBeNull()
    expect(validatePost({ ...valid, relay_type: undefined })).toBeNull()
  })

  it('accepts depth within valid range (0-6)', () => {
    expect(validatePost({ ...valid, depth: 0 })).toBeNull()
    expect(validatePost({ ...valid, depth: 3 })).toBeNull()
    expect(validatePost({ ...valid, depth: 6 })).toBeNull()
  })

  it('rejects depth below 0', () => {
    const result = validatePost({ ...valid, depth: -1 })
    expect(result).toContain('depth')
    expect(result).toContain('-1')
  })

  it('rejects depth above 6', () => {
    const result = validatePost({ ...valid, depth: 7 })
    expect(result).toContain('depth')
    expect(result).toContain('7')
  })

  it('accepts null/omitted depth', () => {
    expect(validatePost(valid)).toBeNull()
    expect(validatePost({ ...valid, depth: undefined })).toBeNull()
  })

  it('validates all four relay types', () => {
    const validTypes = ['board_post', 'desk_drop', 'office_visit', 'reply']
    for (const rt of validTypes) {
      expect(validatePost({ ...valid, relay_type: rt })).toBeNull()
    }
    expect(validTypes.length).toBe(4)
  })
})
