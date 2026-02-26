import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  completeFast: vi.fn(),
  validateCsrfRequest: vi.fn(),
}))

vi.mock('@/lib/auth/auth', () => ({ auth: mocks.auth }))
vi.mock('@/lib/fasting/session-manager', () => ({ completeFast: mocks.completeFast }))
vi.mock('@/lib/security/csrf', () => ({ validateCsrfRequest: mocks.validateCsrfRequest }))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.validateCsrfRequest.mockReturnValue(true)
})

describe('POST /api/fasting/complete', () => {
  it('returns 403 without CSRF', async () => {
    mocks.validateCsrfRequest.mockReturnValue(false)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/complete', {
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
    const req = new Request('http://localhost/api/fasting/complete', {
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
    const req = new Request('http://localhost/api/fasting/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 on success', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mocks.completeFast.mockResolvedValue({ id: 's1', status: 'completed' })
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('returns 404 when session not found', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mocks.completeFast.mockRejectedValue(new Error('Session not found'))
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
  })
})
