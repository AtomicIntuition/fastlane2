import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  validateCsrfRequest: vi.fn(),
  dbInsert: vi.fn(),
  dbSelect: vi.fn(),
}))

let mockResult: unknown[] = []
let callIndex = 0

const mockChain = {
  values: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  then: vi.fn((resolve: (value: unknown) => void) => resolve(mockResult)),
}

vi.mock('@/lib/auth/auth', () => ({ auth: mocks.auth }))
vi.mock('@/lib/security/csrf', () => ({ validateCsrfRequest: mocks.validateCsrfRequest }))
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => mockChain),
    select: vi.fn(() => mockChain),
  },
}))
vi.mock('@/db/schema', () => ({
  dailyCheckins: {},
}))
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}))
vi.mock('@/lib/utils/id', () => ({ generateId: () => 'checkin-id' }))
vi.mock('@/lib/utils/dates', () => ({
  nowUtc: () => 1700000000000,
  toDateString: () => '2023-11-14',
}))

function mockResolveSequence(...calls: unknown[][]) {
  callIndex = 0
  mockChain.then.mockImplementation((resolve: (value: unknown) => void) => {
    const result = calls[callIndex] ?? []
    callIndex++
    return resolve(result)
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.validateCsrfRequest.mockReturnValue(true)
  mockResult = []
  mockChain.values.mockReturnThis()
  mockChain.from.mockReturnThis()
  mockChain.where.mockReturnThis()
  mockChain.then.mockImplementation((resolve: (value: unknown) => void) => resolve(mockResult))
})

describe('POST /api/checkin', () => {
  it('returns 403 without CSRF', async () => {
    mocks.validateCsrfRequest.mockReturnValue(false)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: 'good', hungerLevel: 3, energyLevel: 4 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 401 without auth', async () => {
    mocks.auth.mockResolvedValue(null)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: 'good', hungerLevel: 3, energyLevel: 4 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid mood', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: 'invalid', hungerLevel: 3, energyLevel: 4 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 201 on success', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'u1' } })
    const checkin = { id: 'checkin-id', mood: 'good' }
    // First call: insert (values chain), second call: select the checkin
    mockResolveSequence([], [checkin])

    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: 'good', hungerLevel: 3, energyLevel: 4 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })
})
