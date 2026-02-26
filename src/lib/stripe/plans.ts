export interface Plan {
  id: string
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
  features: string[]
  highlighted?: boolean
}

export const FREE_PLAN: Plan = {
  id: 'free',
  name: 'Free',
  description: 'Get started with intermittent fasting',
  priceMonthly: 0,
  priceYearly: 0,
  stripePriceIdMonthly: '',
  stripePriceIdYearly: '',
  features: [
    '4 fasting protocols (12:12, 14:10, 16:8, 18:6)',
    'Basic timer with notifications',
    'Daily check-ins',
    '7-day history',
    'Current streak tracking',
  ],
}

export const PRO_PLAN: Plan = {
  id: 'pro',
  name: 'Pro',
  description: 'Unlock your full fasting potential',
  priceMonthly: 4.99,
  priceYearly: 39.99,
  stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
  stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? '',
  highlighted: true,
  features: [
    'All free features',
    '8 fasting protocols including OMAD & 36h',
    'Custom fasting schedules',
    'Unlimited history & analytics',
    'Advanced streak statistics',
    'Calendar heatmap view',
    'Trend charts & insights',
    'Weekly summary reports',
    'Priority support',
  ],
}

export const PLANS = [FREE_PLAN, PRO_PLAN] as const

export type PlanId = 'free' | 'pro'

export function getPlan(id: PlanId): Plan {
  return id === 'pro' ? PRO_PLAN : FREE_PLAN
}
