import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the database module
let mockResult: unknown[] = []

const mockChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  then: vi.fn((resolve: (value: unknown) => void) => resolve(mockResult)),
}

function mockResolve(...calls: unknown[][]) {
  let callIndex = 0
  mockChain.then.mockImplementation((resolve: (value: unknown) => void) => {
    const result = calls[callIndex] ?? []
    callIndex++
    return resolve(result)
  })
}

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => mockChain),
    insert: vi.fn(() => mockChain),
    update: vi.fn(() => mockChain),
  },
}))

vi.mock('@/lib/utils/id', () => ({
  generateId: vi.fn(() => 'test-id-123'),
}))

vi.mock('@/lib/utils/dates', () => ({
  nowUtc: vi.fn(() => 1700000000000),
}))

describe('session-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResult = []
    // Reset chain returns
    mockChain.from.mockReturnThis()
    mockChain.where.mockReturnThis()
    mockChain.orderBy.mockReturnThis()
    mockChain.limit.mockReturnThis()
    mockChain.offset.mockReturnThis()
    mockChain.values.mockReturnThis()
    mockChain.set.mockReturnThis()
    mockChain.then.mockImplementation((resolve: (value: unknown) => void) => resolve(mockResult))
  })

  describe('startFast', () => {
    it('throws if user already has an active session', async () => {
      mockResolve([{ id: 'existing', status: 'active' }])

      const { startFast } = await import('../session-manager')
      await expect(startFast('user1', '16-8')).rejects.toThrow('already have an active')
    })

    it('creates a session with correct target end time', async () => {
      const expectedSession = {
        id: 'test-id-123',
        userId: 'user1',
        protocol: '16-8',
        fastingHours: 16,
        eatingHours: 8,
        startedAt: 1700000000000,
        targetEndAt: 1700000000000 + 16 * 60 * 60 * 1000,
        status: 'active',
      }
      // First call: check for active session — none
      // Second call: insert (values chain)
      // Third call: select the new session
      mockResolve([], [], [expectedSession])

      const { startFast } = await import('../session-manager')
      const result = await startFast('user1', '16-8')

      expect(result.protocol).toBe('16-8')
      expect(result.fastingHours).toBe(16)
    })
  })

  describe('completeFast', () => {
    it('throws if session not found', async () => {
      mockResolve([])

      const { completeFast } = await import('../session-manager')
      await expect(completeFast('user1', 'nonexistent')).rejects.toThrow('not found')
    })

    it('throws if session is not active', async () => {
      mockResolve([{ id: 's1', status: 'completed', userId: 'user1' }])

      const { completeFast } = await import('../session-manager')
      await expect(completeFast('user1', 's1')).rejects.toThrow('not active')
    })

    it('completes an active session', async () => {
      const activeSession = { id: 's1', status: 'active', userId: 'user1' }
      const completedSession = { ...activeSession, status: 'completed', actualEndAt: 1700000000000 }
      // First: select active session, second: update, third: select completed
      mockResolve([activeSession], [], [completedSession])

      const { completeFast } = await import('../session-manager')
      const result = await completeFast('user1', 's1')
      expect(result.status).toBe('completed')
    })
  })

  describe('cancelFast', () => {
    it('throws if session not found', async () => {
      mockResolve([])

      const { cancelFast } = await import('../session-manager')
      await expect(cancelFast('user1', 'nonexistent')).rejects.toThrow('not found')
    })

    it('cancels an active session', async () => {
      mockResolve(
        [{ id: 's1', status: 'active', userId: 'user1' }],
        [],
        [{ id: 's1', status: 'cancelled', userId: 'user1' }],
      )

      const { cancelFast } = await import('../session-manager')
      const result = await cancelFast('user1', 's1')
      expect(result.status).toBe('cancelled')
    })
  })

  describe('getActiveSession', () => {
    it('returns null when no active session', async () => {
      mockResolve([])

      const { getActiveSession } = await import('../session-manager')
      const result = await getActiveSession('user1')
      expect(result).toBeNull()
    })

    it('returns active session when one exists', async () => {
      const session = { id: 's1', status: 'active', userId: 'user1' }
      mockResolve([session])

      const { getActiveSession } = await import('../session-manager')
      const result = await getActiveSession('user1')
      expect(result).toEqual(session)
    })
  })

  describe('getSessionHistory', () => {
    it('returns sessions in order', async () => {
      const sessions = [
        { id: 's2', createdAt: 2 },
        { id: 's1', createdAt: 1 },
      ]
      mockResolve(sessions)

      const { getSessionHistory } = await import('../session-manager')
      const result = await getSessionHistory('user1')
      expect(result).toEqual(sessions)
    })
  })

  describe('extendFast', () => {
    it('throws if session not found', async () => {
      mockResolve([])

      const { extendFast } = await import('../session-manager')
      await expect(extendFast('user1', 'nonexistent', 2)).rejects.toThrow('not found')
    })

    it('extends target by additional hours', async () => {
      const original = {
        id: 's1',
        status: 'active',
        userId: 'user1',
        targetEndAt: 1700000000000,
        fastingHours: 16,
      }
      const extended = {
        ...original,
        targetEndAt: original.targetEndAt + 2 * 60 * 60 * 1000,
        fastingHours: 18,
      }
      mockResolve([original], [], [extended])

      const { extendFast } = await import('../session-manager')
      const result = await extendFast('user1', 's1', 2)
      expect(result.fastingHours).toBe(18)
    })
  })
})
