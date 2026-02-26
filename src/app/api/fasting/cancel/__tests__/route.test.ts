import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  cancelFast: vi.fn(),
  validateCsrfRequest: vi.fn(),
}))

vi.mock('@/lib/auth/auth', () => ({ auth: mocks.auth }))
vi.mock('@/lib/fasting/session-manager', () => ({ cancelFast: mocks.cancelFast }))
vi.mock('@/lib/security/csrf', () => ({ validateCsrfRequest: mocks.validateCsrfRequest }))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.validateCsrfRequest.mockReturnValue(true)
})

describe('POST /api/fasting/cancel', () => {
  it('returns 403 without CSRF', async () => {
    mocks.validateCsrfRequest.mockReturnValue(false)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 401 without auth', async () => {
    mocks.auth.mockResolvedValue(null)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 if sessionId missing', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 on successful cancel', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mocks.cancelFast.mockResolvedValue({ id: 's1', status: 'cancelled' })
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('returns 409 when session not active', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mocks.cancelFast.mockRejectedValue(new Error('Session is not active'))
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })
})
