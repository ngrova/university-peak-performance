// ═══════════════════════════════════════════════════════════
// FILE: auth.ts
// PURPOSE: Validates the Bearer token on every incoming
//   request by comparing it to the FLEET_API_KEY environment
//   variable. Rejects unauthorized requests with 401.
// CALLED BY: index.ts
// DATA FLOW: Request Authorization header → compared against
//   FLEET_API_KEY env var → returns true/false.
// ═══════════════════════════════════════════════════════════

/**
 * Checks if the request's Authorization header contains a valid
 * Bearer token matching FLEET_API_KEY. Called at the top of every
 * incoming request before any processing happens. Returns false
 * if the key is missing, malformed, or doesn't match.
 */
export function isAuthorized(request: Request): boolean {
  const header = request.headers.get('authorization')
  if (!header) return false

  const parts = header.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false

  const apiKey = process.env.FLEET_API_KEY
  if (!apiKey) return false

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(parts[1], apiKey)
}

/** Compares two strings in constant time to prevent timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
