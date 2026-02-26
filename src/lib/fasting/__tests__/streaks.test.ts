import { describe, it, expect } from 'vitest'
import { calculateStreaks } from '@/lib/fasting/streaks'

// Helper to create a timestamp for a given date string (YYYY-MM-DD) at noon UTC
function dateMs(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00.000Z`).getTime()
}

// Helper to create a session object
function session(dateStr: string) {
  return { actualEndAt: dateMs(dateStr) }
}

describe('calculateStreaks', () => {
  it('returns zeros for empty sessions array', () => {
    const result = calculateStreaks([], Date.now())
    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      completionRate: 0,
    })
  })

  it('counts current streak correctly (today + consecutive days)', () => {
    const now = dateMs('2026-02-25')
    const sessions = [
      session('2026-02-25'), // today
      session('2026-02-24'), // yesterday
      session('2026-02-23'), // 2 days ago
    ]
    const result = calculateStreaks(sessions, now)
    expect(result.currentStreak).toBe(3)
  })

  it('handles streak broken (no fast today or yesterday)', () => {
    const now = dateMs('2026-02-25')
    const sessions = [
      session('2026-02-22'), // 3 days ago
      session('2026-02-21'), // 4 days ago
    ]
    const result = calculateStreaks(sessions, now)
    expect(result.currentStreak).toBe(0)
  })

  it('calculates longest streak across non-consecutive periods', () => {
    const now = dateMs('2026-02-25')
    const sessions = [
      // Current period (2 days)
      session('2026-02-25'),
      session('2026-02-24'),
      // Gap on 2026-02-23
      // Older period (4 consecutive days)
      session('2026-02-22'),
      session('2026-02-21'),
      session('2026-02-20'),
      session('2026-02-19'),
    ]
    const result = calculateStreaks(sessions, now)
    expect(result.longestStreak).toBe(4)
  })

  it('calculates totalCompleted count', () => {
    const now = dateMs('2026-02-25')
    const sessions = [
      session('2026-02-25'),
      session('2026-02-24'),
      session('2026-02-20'),
      session('2026-02-15'),
      session('2026-02-10'),
    ]
    const result = calculateStreaks(sessions, now)
    expect(result.totalCompleted).toBe(5)
  })

  it('calculates completionRate based on last 30 days', () => {
    const now = dateMs('2026-02-25')
    // Create 15 sessions within the last 30 days
    const sessions = []
    for (let i = 0; i < 15; i++) {
      const day = 25 - i * 2 // every other day
      const month = day > 0 ? '02' : '01'
      const adjustedDay = day > 0 ? day : 31 + day
      sessions.push(session(`2026-${month}-${String(adjustedDay).padStart(2, '0')}`))
    }
    const result = calculateStreaks(sessions, now)
    // 15 sessions in last 30 days = 50%
    expect(result.completionRate).toBe(50)
  })

  it('handles single-day streak', () => {
    const now = dateMs('2026-02-25')
    const sessions = [session('2026-02-25')]
    const result = calculateStreaks(sessions, now)
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })

  it('handles gap of exactly one day (streak breaks)', () => {
    const now = dateMs('2026-02-25')
    const sessions = [
      session('2026-02-25'), // today
      // gap on 2026-02-24
      session('2026-02-23'), // 2 days ago
      session('2026-02-22'), // 3 days ago
    ]
    const result = calculateStreaks(sessions, now)
    // Current streak should be 1 (only today, since yesterday is missing)
    expect(result.currentStreak).toBe(1)
    // Longest streak is 2 (feb 22-23)
    expect(result.longestStreak).toBe(2)
  })

  it('counts current streak when yesterday has a fast but today does not', () => {
    const now = dateMs('2026-02-25')
    const sessions = [
      session('2026-02-24'), // yesterday
      session('2026-02-23'),
      session('2026-02-22'),
    ]
    const result = calculateStreaks(sessions, now)
    // Streak is still alive via yesterday
    expect(result.currentStreak).toBe(3)
  })
})
