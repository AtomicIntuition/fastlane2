import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  startFast: vi.fn(),
  validateCsrfRequest: vi.fn(),
}))

vi.mock('@/lib/auth/auth', () => ({ auth: mocks.auth }))
vi.mock('@/lib/fasting/session-manager', () => ({ startFast: mocks.startFast }))
vi.mock('@/lib/security/csrf', () => ({ validateCsrfRequest: mocks.validateCsrfRequest }))

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.validateCsrfRequest.mockReturnValue(true)
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('POST /api/fasting/start', () => {
  it('returns 403 without valid CSRF token', async () => {
    mocks.validateCsrfRequest.mockReturnValue(false)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocol: '16-8' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 401 without auth', async () => {
    mocks.auth.mockResolvedValue(null)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocol: '16-8' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid protocol', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 201 on success', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mocks.startFast.mockResolvedValue({
      id: 's1',
      protocol: '16-8',
      fastingHours: 16,
      eatingHours: 8,
      status: 'active',
    })
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocol: '16-8' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.protocol).toBe('16-8')
  })

  it('returns 409 when already active', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mocks.startFast.mockRejectedValue(new Error('You already have an active fasting session'))
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/fasting/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocol: '16-8' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })
})
