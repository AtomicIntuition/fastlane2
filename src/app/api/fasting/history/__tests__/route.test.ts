import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getSessionHistory: vi.fn(),
}))

vi.mock('@/lib/auth/auth', () => ({ auth: mocks.auth }))
vi.mock('@/lib/fasting/session-manager', () => ({ getSessionHistory: mocks.getSessionHistory }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/fasting/history', () => {
  it('returns 401 without auth', async () => {
    mocks.auth.mockResolvedValue(null)
    const { GET } = await import('../route')
    const req = new Request('http://localhost/api/fasting/history')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 with session history', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    const sessions = [{ id: 's1', protocol: '16-8' }]
    mocks.getSessionHistory.mockResolvedValue(sessions)

    const { GET } = await import('../route')
    const req = new Request('http://localhost/api/fasting/history')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual(sessions)
  })

  it('respects limit and offset params', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mocks.getSessionHistory.mockResolvedValue([])

    const { GET } = await import('../route')
    const req = new Request('http://localhost/api/fasting/history?limit=10&offset=5')
    await GET(req)

    expect(mocks.getSessionHistory).toHaveBeenCalledWith('u1', 10, 5)
  })

  it('clamps limit to max 200', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mocks.getSessionHistory.mockResolvedValue([])

    const { GET } = await import('../route')
    const req = new Request('http://localhost/api/fasting/history?limit=999')
    await GET(req)

    expect(mocks.getSessionHistory).toHaveBeenCalledWith('u1', 200, 0)
  })
})
