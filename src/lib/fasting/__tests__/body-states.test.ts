import { describe, it, expect } from 'vitest'
import {
  BODY_STATES,
  getCurrentBodyState,
  getNextBodyState,
} from '@/lib/fasting/body-states'

describe('getCurrentBodyState', () => {
  it('returns Anabolic at 0 hours', () => {
    expect(getCurrentBodyState(0).id).toBe('anabolic')
  })

  it('returns Anabolic at 3.9 hours', () => {
    expect(getCurrentBodyState(3.9).id).toBe('anabolic')
  })

  it('returns Catabolic at 4 hours', () => {
    expect(getCurrentBodyState(4).id).toBe('catabolic')
  })

  it('returns Fat Burning at 8 hours', () => {
    expect(getCurrentBodyState(8).id).toBe('fat-burning')
  })

  it('returns Ketosis at 12 hours', () => {
    expect(getCurrentBodyState(12).id).toBe('ketosis')
  })

  it('returns Autophagy at 14 hours', () => {
    expect(getCurrentBodyState(14).id).toBe('autophagy')
  })

  it('returns Deep Autophagy at 16 hours', () => {
    expect(getCurrentBodyState(16).id).toBe('deep-autophagy')
  })

  it('returns Immune Reset at 24 hours', () => {
    expect(getCurrentBodyState(24).id).toBe('immune-reset')
  })

  it('returns Stem Cell at 48 hours', () => {
    expect(getCurrentBodyState(48).id).toBe('stem-cell')
  })

  it('returns Stem Cell beyond 72 hours', () => {
    expect(getCurrentBodyState(100).id).toBe('stem-cell')
  })

  it('returns Anabolic for negative hours', () => {
    expect(getCurrentBodyState(-5).id).toBe('anabolic')
  })
})

describe('getNextBodyState', () => {
  it('returns Catabolic when at 0 hours', () => {
    expect(getNextBodyState(0)?.id).toBe('catabolic')
  })

  it('returns Fat Burning when at 4 hours', () => {
    expect(getNextBodyState(4)?.id).toBe('fat-burning')
  })

  it('returns Ketosis when at 8 hours', () => {
    expect(getNextBodyState(8)?.id).toBe('ketosis')
  })

  it('returns Immune Reset when at 24 hours', () => {
    expect(getNextBodyState(24)?.id).toBe('stem-cell')
  })

  it('returns null when in Stem Cell (48h+)', () => {
    expect(getNextBodyState(48)).toBeNull()
  })

  it('returns null when beyond 72h', () => {
    expect(getNextBodyState(100)).toBeNull()
  })
})

describe('BODY_STATES structure', () => {
  it('has exactly 8 states', () => {
    expect(BODY_STATES).toHaveLength(8)
  })

  it('states are in ascending order by startHour', () => {
    for (let i = 1; i < BODY_STATES.length; i++) {
      expect(BODY_STATES[i].startHour).toBeGreaterThanOrEqual(BODY_STATES[i - 1].endHour)
    }
  })

  it('each state has all required fields', () => {
    for (const state of BODY_STATES) {
      expect(state.id).toBeTruthy()
      expect(state.name).toBeTruthy()
      expect(state.emoji).toBeTruthy()
      expect(typeof state.startHour).toBe('number')
      expect(typeof state.endHour).toBe('number')
      expect(state.description).toBeTruthy()
    }
  })
})
