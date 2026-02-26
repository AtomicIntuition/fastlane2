import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  onboardingSchema,
  checkinSchema,
  startFastSchema,
} from '@/lib/utils/validation'

describe('loginSchema', () => {
  it('accepts valid input', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts valid input', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'different456',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short name', () => {
    const result = registerSchema.safeParse({
      name: 'J',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })
})

describe('onboardingSchema', () => {
  it('accepts valid input', () => {
    const result = onboardingSchema.safeParse({
      fastingGoal: 'weight_loss',
      experienceLevel: 'beginner',
      preferredProtocol: '16-8',
      timezone: 'America/New_York',
    })
    expect(result.success).toBe(true)
  })

  it('accepts all valid goal enums', () => {
    const goals = ['weight_loss', 'health', 'longevity', 'mental_clarity', 'autophagy']
    goals.forEach((goal) => {
      const result = onboardingSchema.safeParse({
        fastingGoal: goal,
        experienceLevel: 'beginner',
        preferredProtocol: '16-8',
        timezone: 'UTC',
      })
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid goal enum', () => {
    const result = onboardingSchema.safeParse({
      fastingGoal: 'invalid_goal',
      experienceLevel: 'beginner',
      preferredProtocol: '16-8',
      timezone: 'America/New_York',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing fields', () => {
    const result = onboardingSchema.safeParse({
      fastingGoal: 'weight_loss',
    })
    expect(result.success).toBe(false)
  })
})

describe('checkinSchema', () => {
  it('accepts valid input', () => {
    const result = checkinSchema.safeParse({
      mood: 'good',
      hungerLevel: 5,
      energyLevel: 7,
      notes: 'Feeling great today!',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid input without optional notes', () => {
    const result = checkinSchema.safeParse({
      mood: 'great',
      hungerLevel: 3,
      energyLevel: 8,
    })
    expect(result.success).toBe(true)
  })

  it('rejects hungerLevel out of range (too low)', () => {
    const result = checkinSchema.safeParse({
      mood: 'okay',
      hungerLevel: 0,
      energyLevel: 5,
    })
    expect(result.success).toBe(false)
  })

  it('rejects hungerLevel out of range (too high)', () => {
    const result = checkinSchema.safeParse({
      mood: 'okay',
      hungerLevel: 11,
      energyLevel: 5,
    })
    expect(result.success).toBe(false)
  })

  it('rejects energyLevel out of range', () => {
    const result = checkinSchema.safeParse({
      mood: 'okay',
      hungerLevel: 5,
      energyLevel: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid mood enum', () => {
    const result = checkinSchema.safeParse({
      mood: 'invalid_mood',
      hungerLevel: 5,
      energyLevel: 5,
    })
    expect(result.success).toBe(false)
  })
})

describe('startFastSchema', () => {
  it('accepts valid input', () => {
    const result = startFastSchema.safeParse({
      protocol: '16-8',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty protocol string', () => {
    const result = startFastSchema.safeParse({
      protocol: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing protocol', () => {
    const result = startFastSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
