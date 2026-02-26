export interface FastingProtocol {
  id: string
  name: string
  description: string
  fastingHours: number
  eatingHours: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  benefits: string[]
  isPro: boolean
}

export const PROTOCOLS: FastingProtocol[] = [
  {
    id: '12-12',
    name: '12:12',
    description: 'Perfect for beginners. Equal fasting and eating windows.',
    fastingHours: 12,
    eatingHours: 12,
    difficulty: 'beginner',
    benefits: ['Easy to maintain', 'Improved digestion', 'Better sleep'],
    isPro: false,
  },
  {
    id: '14-10',
    name: '14:10',
    description: 'A gentle step up from 12:12. Skip late-night snacking.',
    fastingHours: 14,
    eatingHours: 10,
    difficulty: 'beginner',
    benefits: ['Fat burning initiation', 'Improved insulin sensitivity', 'Easy transition'],
    isPro: false,
  },
  {
    id: '16-8',
    name: '16:8',
    description: 'The most popular protocol. Skip breakfast, eat lunch to dinner.',
    fastingHours: 16,
    eatingHours: 8,
    difficulty: 'intermediate',
    benefits: ['Significant fat burning', 'Autophagy begins', 'Mental clarity'],
    isPro: false,
  },
  {
    id: '18-6',
    name: '18:6',
    description: 'Extended fasting window for experienced practitioners.',
    fastingHours: 18,
    eatingHours: 6,
    difficulty: 'intermediate',
    benefits: ['Deep autophagy', 'Growth hormone boost', 'Enhanced focus'],
    isPro: false,
  },
  {
    id: '20-4',
    name: '20:4 (Warrior)',
    description: 'The Warrior Diet. One large meal with a small eating window.',
    fastingHours: 20,
    eatingHours: 4,
    difficulty: 'advanced',
    benefits: ['Maximum autophagy', 'Significant fat loss', 'Metabolic flexibility'],
    isPro: true,
  },
  {
    id: '23-1',
    name: 'OMAD (23:1)',
    description: 'One Meal A Day. Maximum fasting benefits for advanced fasters.',
    fastingHours: 23,
    eatingHours: 1,
    difficulty: 'advanced',
    benefits: ['Peak autophagy', 'Extreme fat adaptation', 'Simplified eating'],
    isPro: true,
  },
  {
    id: '36-12',
    name: '36-Hour Fast',
    description: 'Extended fast spanning a full day. For experienced fasters only.',
    fastingHours: 36,
    eatingHours: 12,
    difficulty: 'advanced',
    benefits: ['Deep cellular repair', 'Immune system reset', 'Maximum fat oxidation'],
    isPro: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Create your own fasting schedule. Set any fasting and eating window.',
    fastingHours: 0,
    eatingHours: 0,
    difficulty: 'intermediate',
    benefits: ['Full flexibility', 'Personalized approach'],
    isPro: true,
  },
]

export function getProtocol(id: string): FastingProtocol | undefined {
  return PROTOCOLS.find((p) => p.id === id)
}

export function getProtocolsByDifficulty(difficulty: FastingProtocol['difficulty']): FastingProtocol[] {
  return PROTOCOLS.filter((p) => p.difficulty === difficulty)
}

export function getFreeProtocols(): FastingProtocol[] {
  return PROTOCOLS.filter((p) => !p.isPro)
}

export function recommendProtocol(
  experience: 'beginner' | 'intermediate' | 'advanced',
  goal: string
): FastingProtocol {
  if (experience === 'beginner') {
    return goal === 'weight_loss'
      ? PROTOCOLS.find((p) => p.id === '14-10')!
      : PROTOCOLS.find((p) => p.id === '12-12')!
  }
  if (experience === 'intermediate') {
    return goal === 'autophagy' || goal === 'longevity'
      ? PROTOCOLS.find((p) => p.id === '18-6')!
      : PROTOCOLS.find((p) => p.id === '16-8')!
  }
  // advanced
  return goal === 'autophagy'
    ? PROTOCOLS.find((p) => p.id === '20-4')!
    : PROTOCOLS.find((p) => p.id === '18-6')!
}
