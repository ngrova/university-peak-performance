// ═══════════════════════════════════════════════════════════
// FILE: auth.ts
// PURPOSE: Validates the Bearer token on incoming requests.
//   If FLEET_API_KEY is set, requires a matching token. If
//   unset, allows all requests (for claude.ai which only
//   supports authless or OAuth MCP servers).
// CALLED BY: index.ts
// DATA FLOW: Check FLEET_API_KEY env → if unset, allow all →
//   if set, compare Authorization header → true/false.
// ═══════════════════════════════════════════════════════════

/**
 * Checks if the request is authorized. Called at the top of
 * every incoming request. If FLEET_API_KEY is not configured,
 * allows all requests (open mode for claude.ai). If configured,
 * requires a matching Bearer token in the Authorization header.
 */
export function isAuthorized(request: Request): boolean {
  const apiKey = process.env.FLEET_API_KEY
  // No key configured — open mode (for authless MCP clients)
  if (!apiKey) return true

  const header = request.headers.get('authorization')
  if (!header) return false

  const parts = header.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false

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
