import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  validateCsrfRequest: vi.fn(),
}))

let mockResult: unknown[] = []

const mockChain = {
  values: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  then: vi.fn((resolve: (value: unknown) => void) => resolve(mockResult)),
}

vi.mock('@/lib/auth/auth', () => ({ auth: mocks.auth }))
vi.mock('@/lib/security/csrf', () => ({ validateCsrfRequest: mocks.validateCsrfRequest }))
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => mockChain),
    insert: vi.fn(() => mockChain),
    update: vi.fn(() => mockChain),
  },
}))
vi.mock('@/db/schema', () => ({ userProfiles: {} }))
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }))
vi.mock('@/lib/utils/id', () => ({ generateId: () => 'profile-id' }))
vi.mock('@/lib/utils/dates', () => ({ nowUtc: () => 1700000000000 }))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.validateCsrfRequest.mockReturnValue(true)
  mockResult = []
  mockChain.values.mockReturnThis()
  mockChain.from.mockReturnThis()
  mockChain.where.mockReturnThis()
  mockChain.set.mockReturnThis()
  mockChain.then.mockImplementation((resolve: (value: unknown) => void) => resolve(mockResult))
})

describe('POST /api/auth/onboarding', () => {
  it('returns 403 without CSRF', async () => {
    mocks.validateCsrfRequest.mockReturnValue(false)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fastingGoal: 'weight_loss',
        experienceLevel: 'beginner',
        preferredProtocol: '16-8',
        timezone: 'UTC',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 401 without auth', async () => {
    mocks.auth.mockResolvedValue(null)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fastingGoal: 'weight_loss',
        experienceLevel: 'beginner',
        preferredProtocol: '16-8',
        timezone: 'UTC',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid body', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fastingGoal: 'invalid_goal' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('creates profile for new user', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mockResult = [] // no existing profile
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fastingGoal: 'weight_loss',
        experienceLevel: 'beginner',
        preferredProtocol: '16-8',
        timezone: 'UTC',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('updates profile for existing user', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    mockResult = [{ id: 'profile-existing', userId: 'u1' }] // existing profile
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fastingGoal: 'health',
        experienceLevel: 'intermediate',
        preferredProtocol: '18-6',
        timezone: 'America/New_York',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
