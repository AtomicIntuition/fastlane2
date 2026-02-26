import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  validateCsrfRequest: vi.fn(),
  dbSelect: vi.fn(),
}))

let mockSelectResult: unknown[] = []

const mockChain = {
  values: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  then: vi.fn((resolve: (value: unknown) => void) => resolve(mockSelectResult)),
}

vi.mock('@/lib/security/csrf', () => ({ validateCsrfRequest: mocks.validateCsrfRequest }))
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => mockChain),
    insert: vi.fn(() => mockChain),
  },
}))
vi.mock('@/db/schema', () => ({ users: {} }))
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }))
vi.mock('bcryptjs', () => ({ hashSync: vi.fn(() => 'hashed') }))
vi.mock('@/lib/utils/id', () => ({ generateId: () => 'user-id' }))
vi.mock('@/lib/utils/dates', () => ({ nowUtc: () => 1700000000000 }))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.validateCsrfRequest.mockReturnValue(true)
  mockSelectResult = []
  mockChain.values.mockReturnThis()
  mockChain.from.mockReturnThis()
  mockChain.where.mockReturnThis()
  mockChain.then.mockImplementation((resolve: (value: unknown) => void) => resolve(mockSelectResult))
})

describe('POST /api/auth/register', () => {
  it('returns 403 without CSRF', async () => {
    mocks.validateCsrfRequest.mockReturnValue(false)
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123', confirmPassword: 'password123' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid body', async () => {
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 409 for duplicate email', async () => {
    mockSelectResult = [{ id: 'existing', email: 'test@example.com' }]
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123', confirmPassword: 'password123' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('returns 200 on successful registration', async () => {
    mockSelectResult = [] // no existing user
    const { POST } = await import('../route')
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123', confirmPassword: 'password123' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })
})
