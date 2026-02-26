import { describe, it, expect } from 'vitest'
import { getEntitlements, hasEntitlement, type Entitlements } from '@/lib/stripe/entitlements'

describe('getEntitlements', () => {
  it('free plan has correct entitlements (limited protocols, no advanced features)', () => {
    const entitlements = getEntitlements('free')
    expect(entitlements.maxProtocols).toBe(4)
    expect(entitlements.customProtocol).toBe(false)
    expect(entitlements.unlimitedHistory).toBe(false)
    expect(entitlements.advancedStats).toBe(false)
    expect(entitlements.calendarHeatmap).toBe(false)
    expect(entitlements.trendCharts).toBe(false)
    expect(entitlements.weeklySummary).toBe(false)
    expect(entitlements.prioritySupport).toBe(false)
  })

  it('pro plan has all entitlements enabled', () => {
    const entitlements = getEntitlements('pro')
    expect(entitlements.maxProtocols).toBe(Infinity)
    expect(entitlements.customProtocol).toBe(true)
    expect(entitlements.unlimitedHistory).toBe(true)
    expect(entitlements.advancedStats).toBe(true)
    expect(entitlements.calendarHeatmap).toBe(true)
    expect(entitlements.trendCharts).toBe(true)
    expect(entitlements.weeklySummary).toBe(true)
    expect(entitlements.prioritySupport).toBe(true)
  })

  it('returns correct object shape', () => {
    const entitlements = getEntitlements('free')
    const expectedKeys: (keyof Entitlements)[] = [
      'maxProtocols',
      'customProtocol',
      'unlimitedHistory',
      'advancedStats',
      'calendarHeatmap',
      'trendCharts',
      'weeklySummary',
      'prioritySupport',
    ]
    expectedKeys.forEach((key) => {
      expect(entitlements).toHaveProperty(key)
    })
    expect(Object.keys(entitlements)).toHaveLength(expectedKeys.length)
  })
})

describe('hasEntitlement', () => {
  it('returns true for pro features on pro plan', () => {
    expect(hasEntitlement('pro', 'customProtocol')).toBe(true)
    expect(hasEntitlement('pro', 'unlimitedHistory')).toBe(true)
    expect(hasEntitlement('pro', 'advancedStats')).toBe(true)
    expect(hasEntitlement('pro', 'calendarHeatmap')).toBe(true)
    expect(hasEntitlement('pro', 'trendCharts')).toBe(true)
    expect(hasEntitlement('pro', 'weeklySummary')).toBe(true)
    expect(hasEntitlement('pro', 'prioritySupport')).toBe(true)
  })

  it('returns false for pro features on free plan', () => {
    expect(hasEntitlement('free', 'customProtocol')).toBe(false)
    expect(hasEntitlement('free', 'unlimitedHistory')).toBe(false)
    expect(hasEntitlement('free', 'advancedStats')).toBe(false)
    expect(hasEntitlement('free', 'calendarHeatmap')).toBe(false)
    expect(hasEntitlement('free', 'trendCharts')).toBe(false)
    expect(hasEntitlement('free', 'weeklySummary')).toBe(false)
    expect(hasEntitlement('free', 'prioritySupport')).toBe(false)
  })

  it('returns true for maxProtocols on both plans (truthy number)', () => {
    expect(hasEntitlement('free', 'maxProtocols')).toBe(true)
    expect(hasEntitlement('pro', 'maxProtocols')).toBe(true)
  })
})
