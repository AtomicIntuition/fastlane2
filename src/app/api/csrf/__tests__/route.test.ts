import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  generateCsrfToken: vi.fn(),
}))

vi.mock('@/lib/security/csrf', () => ({
  generateCsrfToken: mocks.generateCsrfToken,
  CSRF_COOKIE: 'csrf_token',
}))

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('GET /api/csrf', () => {
  it('returns token in body', async () => {
    mocks.generateCsrfToken.mockReturnValue('abc123.def456')
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.csrfToken).toBe('abc123.def456')
  })

  it('sets httpOnly cookie', async () => {
    mocks.generateCsrfToken.mockReturnValue('abc123.def456')
    const { GET } = await import('../route')
    const res = await GET()
    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toContain('csrf_token=abc123.def456')
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie?.toLowerCase()).toContain('samesite=strict')
  })
})
