// ═══════════════════════════════════════════════════════════
// FILE: rate-limiter.ts
// PURPOSE: In-memory per-agent rate limiter that caps writes
//   to 20 per agent per hour. Resets on cold start, which is
//   acceptable for a best-effort throttle.
// CALLED BY: router.ts (before write operations)
// DATA FLOW: agent_id → check/increment counter in memory →
//   returns { allowed: boolean, retryAfterMs? }.
// ═══════════════════════════════════════════════════════════

const MAX_WRITES_PER_HOUR = 20
const WINDOW_MS = 60 * 60 * 1000

interface Bucket {
  count: number
  resetAt: number
}

// In-memory store — resets on cold start
const buckets = new Map<string, Bucket>()

/**
 * Checks whether an agent is allowed to perform write operations.
 * Called by the router before executing post, respond, record_decision,
 * save_document, batch_post, or sync (when wrap_up is present).
 * The count parameter allows batch operations to consume multiple
 * slots in one call. Returns { allowed: false, retryAfterMs } if
 * the limit would be exceeded.
 */
export function checkRateLimit(
  agentId: string,
  count = 1
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now()
  const bucket = buckets.get(agentId)

  // First write or window expired — start fresh
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(agentId, { count, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }

  if (bucket.count + count > MAX_WRITES_PER_HOUR) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now }
  }

  bucket.count += count
  return { allowed: true }
}
