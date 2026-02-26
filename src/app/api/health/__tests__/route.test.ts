import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  dbExecute: vi.fn(),
}))

vi.mock('@/db', () => ({
  db: {
    execute: mocks.dbExecute,
  },
}))
vi.mock('drizzle-orm', () => ({
  sql: (strings: TemplateStringsArray) => strings[0],
}))

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  process.env.AUTH_SECRET = 'test-secret'
  process.env.STRIPE_SECRET_KEY = 'sk_test'
  process.env.SENTRY_DSN = 'https://sentry.io/123'
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('GET /api/health', () => {
  it('returns ok when all checks pass', async () => {
    mocks.dbExecute.mockResolvedValue(undefined)
    const { GET } = await import('../route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.checks).toHaveLength(4)
    expect(body.checks.every((c: { status: string }) => c.status === 'pass')).toBe(true)
  })

  it('returns degraded when Sentry DSN is missing', async () => {
    mocks.dbExecute.mockResolvedValue(undefined)
    delete process.env.SENTRY_DSN
    const { GET } = await import('../route')
    const res = await GET()
    const body = await res.json()
    // Sentry is optional so it's degraded but not 503
    expect(body.status).toBe('degraded')
    expect(res.status).toBe(200)
  })

  it('returns degraded when DB is down', async () => {
    mocks.dbExecute.mockRejectedValue(new Error('Connection refused'))
    const { GET } = await import('../route')
    const res = await GET()
    const body = await res.json()
    expect(body.status).toBe('degraded')
    const dbCheck = body.checks.find((c: { name: string }) => c.name === 'database')
    expect(dbCheck.status).toBe('fail')
  })

  it('includes timestamp in response', async () => {
    mocks.dbExecute.mockResolvedValue(undefined)
    const { GET } = await import('../route')
    const res = await GET()
    const body = await res.json()
    expect(body.timestamp).toBeDefined()
  })
})
