/**
 * Double-submit cookie CSRF protection with HMAC-SHA256.
 *
 * Token format: `{nonce}.{hmac}` where:
 *   - nonce: 32 hex chars of randomness
 *   - hmac:  16 hex chars (truncated HMAC-SHA256 of nonce using AUTH_SECRET)
 */

import { createHmac, randomBytes } from 'crypto'

const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return secret
}

function hmacSign(nonce: string): string {
  return createHmac('sha256', getSecret()).update(nonce).digest('hex').slice(0, 16)
}

/** Generate a CSRF token: `{nonce}.{hmac}` */
export function generateCsrfToken(): string {
  const nonce = randomBytes(16).toString('hex') // 32 hex chars
  const hmac = hmacSign(nonce)
  return `${nonce}.${hmac}`
}

/** Verify that a token has a valid HMAC */
function isValidToken(token: string): boolean {
  const [nonce, hmac] = token.split('.')
  if (!nonce || !hmac || nonce.length !== 32 || hmac.length !== 16) return false
  const expected = hmacSign(nonce)
  // Constant-time comparison
  if (expected.length !== hmac.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ hmac.charCodeAt(i)
  }
  return diff === 0
}

/**
 * Validate CSRF on an incoming request.
 * Checks that both the cookie and the header are present, match, and are valid.
 * Returns `true` if valid, `false` otherwise.
 */
export function validateCsrfRequest(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...rest] = c.trim().split('=')
      return [key, rest.join('=')]
    }),
  )

  const cookieToken = cookies[CSRF_COOKIE]
  const headerToken = request.headers.get(CSRF_HEADER)

  if (!cookieToken || !headerToken) return false
  if (cookieToken !== headerToken) return false
  return isValidToken(headerToken)
}

export { CSRF_COOKIE, CSRF_HEADER }
