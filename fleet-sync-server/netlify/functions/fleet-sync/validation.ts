// ═══════════════════════════════════════════════════════════
// FILE: validation.ts
// PURPOSE: Shared input validation helpers used by tool
//   handlers to check string lengths, enum values, and
//   required fields before writing to the database.
// CALLED BY: handlers/post.ts, handlers/respond.ts,
//   handlers/record-decision.ts
// DATA FLOW: Raw tool arguments → validated → error string
//   returned if invalid, null if valid.
// ═══════════════════════════════════════════════════════════

/** Checks that a required string field is present and non-empty. */
export function requireString(
  value: unknown,
  name: string
): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return `${name} is required and must be a non-empty string`
  }
  return null
}

/** Checks that a string does not exceed maxLen characters. */
export function checkLength(
  value: string,
  name: string,
  maxLen: number
): string | null {
  if (value.length > maxLen) {
    return `${name} must be ${maxLen} characters or fewer (got ${value.length})`
  }
  return null
}

/** Checks that a value is one of the allowed enum values. */
export function checkEnum(
  value: string,
  name: string,
  allowed: readonly string[]
): string | null {
  if (!allowed.includes(value)) {
    return `${name} must be one of: ${allowed.join(', ')}`
  }
  return null
}
