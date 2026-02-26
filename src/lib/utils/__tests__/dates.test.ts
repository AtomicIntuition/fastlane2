import { describe, it, expect } from 'vitest'
import {
  nowUtc,
  formatDuration,
  toDateString,
  startOfDay,
  daysBetween,
} from '@/lib/utils/dates'

describe('nowUtc', () => {
  it('returns a reasonable timestamp', () => {
    const before = Date.now()
    const result = nowUtc()
    const after = Date.now()
    expect(result).toBeGreaterThanOrEqual(before)
    expect(result).toBeLessThanOrEqual(after)
    expect(typeof result).toBe('number')
  })
})

describe('formatDuration', () => {
  it('formats hours and minutes correctly', () => {
    // 2 hours and 30 minutes
    const ms = (2 * 60 + 30) * 60 * 1000
    expect(formatDuration(ms)).toBe('2h 30m')
  })

  it('formats minutes and seconds when under one hour', () => {
    // 45 minutes and 15 seconds
    const ms = (45 * 60 + 15) * 1000
    expect(formatDuration(ms)).toBe('45m 15s')
  })

  it('formats exactly one hour', () => {
    const ms = 60 * 60 * 1000
    expect(formatDuration(ms)).toBe('1h 0m')
  })

  it('formats zero milliseconds', () => {
    expect(formatDuration(0)).toBe('0m 0s')
  })

  it('handles negative values', () => {
    expect(formatDuration(-1000)).toBe('0m 0s')
    expect(formatDuration(-99999)).toBe('0m 0s')
  })

  it('handles large values', () => {
    // 48 hours
    const ms = 48 * 60 * 60 * 1000
    expect(formatDuration(ms)).toBe('48h 0m')
  })

  it('formats seconds only when under one minute', () => {
    const ms = 30 * 1000
    expect(formatDuration(ms)).toBe('0m 30s')
  })
})

describe('toDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    // 2026-02-25T12:00:00.000Z
    const ms = new Date('2026-02-25T12:00:00.000Z').getTime()
    expect(toDateString(ms)).toBe('2026-02-25')
  })

  it('handles epoch zero', () => {
    expect(toDateString(0)).toBe('1970-01-01')
  })

  it('handles end-of-year date', () => {
    const ms = new Date('2025-12-31T23:59:59.999Z').getTime()
    expect(toDateString(ms)).toBe('2025-12-31')
  })
})

describe('startOfDay', () => {
  it('returns midnight UTC for a mid-day timestamp', () => {
    const ms = new Date('2026-02-25T15:30:45.123Z').getTime()
    const result = startOfDay(ms)
    const resultDate = new Date(result)
    expect(resultDate.getUTCHours()).toBe(0)
    expect(resultDate.getUTCMinutes()).toBe(0)
    expect(resultDate.getUTCSeconds()).toBe(0)
    expect(resultDate.getUTCMilliseconds()).toBe(0)
  })

  it('returns the same value for a timestamp already at midnight', () => {
    const ms = new Date('2026-02-25T00:00:00.000Z').getTime()
    expect(startOfDay(ms)).toBe(ms)
  })

  it('preserves the date', () => {
    const ms = new Date('2026-07-04T18:45:00.000Z').getTime()
    const result = startOfDay(ms)
    const resultDate = new Date(result)
    expect(resultDate.getUTCFullYear()).toBe(2026)
    expect(resultDate.getUTCMonth()).toBe(6) // July is month 6 (0-indexed)
    expect(resultDate.getUTCDate()).toBe(4)
  })
})

describe('daysBetween', () => {
  it('calculates correctly for dates several days apart', () => {
    const a = new Date('2026-02-20T00:00:00.000Z').getTime()
    const b = new Date('2026-02-25T00:00:00.000Z').getTime()
    expect(daysBetween(a, b)).toBe(5)
  })

  it('returns 0 for same timestamp', () => {
    const ts = Date.now()
    expect(daysBetween(ts, ts)).toBe(0)
  })

  it('is order-independent (absolute difference)', () => {
    const a = new Date('2026-01-01T00:00:00.000Z').getTime()
    const b = new Date('2026-01-10T00:00:00.000Z').getTime()
    expect(daysBetween(a, b)).toBe(daysBetween(b, a))
  })

  it('floors partial days', () => {
    const a = new Date('2026-02-25T00:00:00.000Z').getTime()
    const b = new Date('2026-02-26T12:00:00.000Z').getTime() // 1.5 days
    expect(daysBetween(a, b)).toBe(1)
  })
})
