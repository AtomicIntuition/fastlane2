import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Set AUTH_SECRET before importing the module
const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env.AUTH_SECRET = 'test-secret-minimum-32-characters-long'
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('CSRF', () => {
  it('generateCsrfToken returns nonce.hmac format', async () => {
    const { generateCsrfToken } = await import('../csrf')
    const token = generateCsrfToken()
    const parts = token.split('.')
    expect(parts).toHaveLength(2)
    expect(parts[0]).toHaveLength(32) // 16 bytes = 32 hex
    expect(parts[1]).toHaveLength(16) // truncated HMAC
  })

  it('generates unique tokens', async () => {
    const { generateCsrfToken } = await import('../csrf')
    const t1 = generateCsrfToken()
    const t2 = generateCsrfToken()
    expect(t1).not.toBe(t2)
  })

  it('validateCsrfRequest returns true for valid token pair', async () => {
    const { generateCsrfToken, validateCsrfRequest, CSRF_COOKIE, CSRF_HEADER } = await import('../csrf')
    const token = generateCsrfToken()

    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: {
        cookie: `${CSRF_COOKIE}=${token}`,
        [CSRF_HEADER]: token,
      },
    })

    expect(validateCsrfRequest(request)).toBe(true)
  })

  it('validateCsrfRequest returns false when cookie is missing', async () => {
    const { generateCsrfToken, validateCsrfRequest, CSRF_HEADER } = await import('../csrf')
    const token = generateCsrfToken()

    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: {
        [CSRF_HEADER]: token,
      },
    })

    expect(validateCsrfRequest(request)).toBe(false)
  })

  it('validateCsrfRequest returns false when header is missing', async () => {
    const { generateCsrfToken, validateCsrfRequest, CSRF_COOKIE } = await import('../csrf')
    const token = generateCsrfToken()

    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: {
        cookie: `${CSRF_COOKIE}=${token}`,
      },
    })

    expect(validateCsrfRequest(request)).toBe(false)
  })

  it('validateCsrfRequest returns false when cookie and header mismatch', async () => {
    const { generateCsrfToken, validateCsrfRequest, CSRF_COOKIE, CSRF_HEADER } = await import('../csrf')
    const token1 = generateCsrfToken()
    const token2 = generateCsrfToken()

    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: {
        cookie: `${CSRF_COOKIE}=${token1}`,
        [CSRF_HEADER]: token2,
      },
    })

    expect(validateCsrfRequest(request)).toBe(false)
  })

  it('validateCsrfRequest returns false for tampered token', async () => {
    const { validateCsrfRequest, CSRF_COOKIE, CSRF_HEADER } = await import('../csrf')
    const tampered = 'a'.repeat(32) + '.badhmac123456789'

    const request = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: {
        cookie: `${CSRF_COOKIE}=${tampered}`,
        [CSRF_HEADER]: tampered,
      },
    })

    expect(validateCsrfRequest(request)).toBe(false)
  })
})
