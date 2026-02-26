import { describe, it, expect } from 'vitest'
import {
  PROTOCOLS,
  getProtocol,
  getProtocolsByDifficulty,
  getFreeProtocols,
  recommendProtocol,
  type FastingProtocol,
} from '@/lib/fasting/protocols'

describe('getProtocol', () => {
  it('returns correct protocol by ID', () => {
    const protocol = getProtocol('16-8')
    expect(protocol).toBeDefined()
    expect(protocol!.id).toBe('16-8')
    expect(protocol!.name).toBe('16:8')
    expect(protocol!.fastingHours).toBe(16)
    expect(protocol!.eatingHours).toBe(8)
  })

  it('returns undefined for invalid ID', () => {
    const protocol = getProtocol('nonexistent')
    expect(protocol).toBeUndefined()
  })
})

describe('getProtocolsByDifficulty', () => {
  it('filters beginner protocols correctly', () => {
    const beginnerProtocols = getProtocolsByDifficulty('beginner')
    expect(beginnerProtocols.length).toBeGreaterThan(0)
    beginnerProtocols.forEach((p) => {
      expect(p.difficulty).toBe('beginner')
    })
  })

  it('filters intermediate protocols correctly', () => {
    const intermediateProtocols = getProtocolsByDifficulty('intermediate')
    expect(intermediateProtocols.length).toBeGreaterThan(0)
    intermediateProtocols.forEach((p) => {
      expect(p.difficulty).toBe('intermediate')
    })
  })

  it('filters advanced protocols correctly', () => {
    const advancedProtocols = getProtocolsByDifficulty('advanced')
    expect(advancedProtocols.length).toBeGreaterThan(0)
    advancedProtocols.forEach((p) => {
      expect(p.difficulty).toBe('advanced')
    })
  })
})

describe('getFreeProtocols', () => {
  it('returns only non-pro protocols', () => {
    const freeProtocols = getFreeProtocols()
    expect(freeProtocols.length).toBeGreaterThan(0)
    freeProtocols.forEach((p) => {
      expect(p.isPro).toBe(false)
    })
  })

  it('does not include any pro protocols', () => {
    const freeProtocols = getFreeProtocols()
    const freeIds = freeProtocols.map((p) => p.id)
    const proProtocols = PROTOCOLS.filter((p) => p.isPro)
    proProtocols.forEach((p) => {
      expect(freeIds).not.toContain(p.id)
    })
  })
})

describe('recommendProtocol', () => {
  it('returns correct protocol for beginner + weight_loss', () => {
    const protocol = recommendProtocol('beginner', 'weight_loss')
    expect(protocol.id).toBe('14-10')
  })

  it('returns 12-12 for beginner with non-weight-loss goal', () => {
    const protocol = recommendProtocol('beginner', 'health')
    expect(protocol.id).toBe('12-12')
  })

  it('returns correct protocol for intermediate + autophagy', () => {
    const protocol = recommendProtocol('intermediate', 'autophagy')
    expect(protocol.id).toBe('18-6')
  })

  it('returns 16-8 for intermediate with non-autophagy/longevity goal', () => {
    const protocol = recommendProtocol('intermediate', 'weight_loss')
    expect(protocol.id).toBe('16-8')
  })

  it('returns correct protocol for advanced + autophagy', () => {
    const protocol = recommendProtocol('advanced', 'autophagy')
    expect(protocol.id).toBe('20-4')
  })

  it('returns 18-6 for advanced with non-autophagy goal', () => {
    const protocol = recommendProtocol('advanced', 'weight_loss')
    expect(protocol.id).toBe('18-6')
  })
})

describe('All protocols have required fields', () => {
  it.each(PROTOCOLS)('protocol "$name" has id, name, fastingHours, eatingHours', (protocol: FastingProtocol) => {
    expect(protocol.id).toBeDefined()
    expect(typeof protocol.id).toBe('string')
    expect(protocol.id.length).toBeGreaterThan(0)

    expect(protocol.name).toBeDefined()
    expect(typeof protocol.name).toBe('string')
    expect(protocol.name.length).toBeGreaterThan(0)

    expect(protocol.fastingHours).toBeDefined()
    expect(typeof protocol.fastingHours).toBe('number')

    expect(protocol.eatingHours).toBeDefined()
    expect(typeof protocol.eatingHours).toBe('number')
  })
})
