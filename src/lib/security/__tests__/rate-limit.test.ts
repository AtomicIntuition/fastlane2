import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, resolveRule, _resetRateLimitStore } from '../rate-limit'

beforeEach(() => {
  _resetRateLimitStore()
})

describe('resolveRule', () => {
  it('returns auth rule for /api/auth paths', () => {
    const rule = resolveRule('/api/auth/login')
    expect(rule.maxRequests).toBe(10)
  })

  it('returns webhook rule for /api/stripe/webhook', () => {
    const rule = resolveRule('/api/stripe/webhook')
    expect(rule.maxRequests).toBe(30)
  })

  it('returns catch-all rule for other /api paths', () => {
    const rule = resolveRule('/api/fasting/start')
    expect(rule.maxRequests).toBe(60)
  })
})

describe('checkRateLimit', () => {
  it('allows requests under the limit', () => {
    const result = checkRateLimit('1.2.3.4', '/api/fasting/start')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(59)
  })

  it('tracks remaining count correctly', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('1.2.3.4', '/api/fasting/start')
    }
    const result = checkRateLimit('1.2.3.4', '/api/fasting/start')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(54) // 60 - 6
  })

  it('blocks requests over the limit', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('1.2.3.4', '/api/auth/login')
    }
    const result = checkRateLimit('1.2.3.4', '/api/auth/login')
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('tracks different IPs independently', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('1.2.3.4', '/api/auth/login')
    }
    const blocked = checkRateLimit('1.2.3.4', '/api/auth/login')
    expect(blocked.allowed).toBe(false)

    const allowed = checkRateLimit('5.6.7.8', '/api/auth/login')
    expect(allowed.allowed).toBe(true)
  })

  it('isolates rate limits between route categories', () => {
    // Max out auth limit
    for (let i = 0; i < 10; i++) {
      checkRateLimit('1.2.3.4', '/api/auth/login')
    }
    const authBlocked = checkRateLimit('1.2.3.4', '/api/auth/login')
    expect(authBlocked.allowed).toBe(false)

    // General API should still be allowed
    const apiAllowed = checkRateLimit('1.2.3.4', '/api/fasting/start')
    expect(apiAllowed.allowed).toBe(true)
  })

  it('returns a future resetAt timestamp', () => {
    const result = checkRateLimit('1.2.3.4', '/api/fasting/start')
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })
})
