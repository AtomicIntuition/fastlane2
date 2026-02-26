import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  extendFast: vi.fn(),
  validateCsrfRequest: vi.fn(),
}))

vi.mock('@/lib/auth/auth', () => ({ auth: mocks.auth }))
vi.mock('@/lib/fasting/session-manager', () => ({ extendFast: mocks.extendFast }))
vi.mock('@/lib/security/csrf', () => ({ validateCsrfRequest: mocks.validateCsrfRequest }))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.validateCsrfRequest.mockReturnValue(true)
})

describe('POST /api/fasting/extend', () => {
  it('returns 403 without CSRF', async () => {
    mocks.validateCsrfRequest.mockReturnValue(false)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/extend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1', additionalHours: 2 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 401 without auth', async () => {
    mocks.auth.mockResolvedValue(null)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/extend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1', additionalHours: 2 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid additionalHours', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/extend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1', additionalHours: 50 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for zero additionalHours', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/extend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1', additionalHours: 0 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 on success', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mocks.extendFast.mockResolvedValue({ id: 's1', fastingHours: 18 })
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/extend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1', additionalHours: 2 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
