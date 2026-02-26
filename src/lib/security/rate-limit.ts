/**
 * Sliding-window in-memory rate limiter.
 * Tracks request timestamps per IP and enforces per-route limits.
 */

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number // epoch ms when the oldest entry expires
}

interface RateLimitRule {
  windowMs: number
  maxRequests: number
}

// IP → timestamp[] (request times within the current window)
const store = new Map<string, number[]>()

// Cleanup stale entries every 60 seconds
const CLEANUP_INTERVAL_MS = 60_000
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function ensureCleanupTimer() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, timestamps] of store) {
      const fresh = timestamps.filter((t) => now - t < 120_000) // keep 2 min window max
      if (fresh.length === 0) {
        store.delete(key)
      } else {
        store.set(key, fresh)
      }
    }
    // If the store is empty, stop the timer to avoid leaking in tests
    if (store.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer)
      cleanupTimer = null
    }
  }, CLEANUP_INTERVAL_MS)
  // Allow Node to exit even if this timer is running
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

/** Route-specific rate limit rules */
export const RATE_LIMITS: Record<string, RateLimitRule> = {
  '/api/auth': { windowMs: 60_000, maxRequests: 10 },
  '/api/stripe/webhook': { windowMs: 60_000, maxRequests: 30 },
  '/api': { windowMs: 60_000, maxRequests: 60 },
}

/** Resolve the tightest matching rule for a pathname */
export function resolveRule(pathname: string): RateLimitRule {
  if (pathname.startsWith('/api/auth')) return RATE_LIMITS['/api/auth']
  if (pathname.startsWith('/api/stripe/webhook')) return RATE_LIMITS['/api/stripe/webhook']
  return RATE_LIMITS['/api']
}

/**
 * Check whether a request from `ip` to `pathname` is within limits.
 * Returns rate-limit metadata for setting response headers.
 */
export function checkRateLimit(ip: string, pathname: string): RateLimitResult {
  ensureCleanupTimer()

  const rule = resolveRule(pathname)
  const now = Date.now()
  const windowStart = now - rule.windowMs

  // Build a composite key: ip + rule-path for isolation
  const ruleKey = pathname.startsWith('/api/auth')
    ? '/api/auth'
    : pathname.startsWith('/api/stripe/webhook')
      ? '/api/stripe/webhook'
      : '/api'
  const key = `${ip}:${ruleKey}`

  const timestamps = store.get(key) ?? []
  // Drop requests outside the window
  const recent = timestamps.filter((t) => t > windowStart)

  if (recent.length >= rule.maxRequests) {
    // Oldest timestamp in window determines reset
    const resetAt = recent[0] + rule.windowMs
    store.set(key, recent)
    return { allowed: false, remaining: 0, resetAt }
  }

  recent.push(now)
  store.set(key, recent)

  return {
    allowed: true,
    remaining: rule.maxRequests - recent.length,
    resetAt: recent[0] + rule.windowMs,
  }
}

/** Clear the store — useful in tests */
export function _resetRateLimitStore() {
  store.clear()
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
}
