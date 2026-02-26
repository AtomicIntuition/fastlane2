'use client'

import { useMemo } from 'react'
import { getEntitlements, hasEntitlement, type EntitlementKey } from '@/lib/stripe/entitlements'
import type { PlanId } from '@/lib/stripe/plans'

export function useEntitlement(planId: PlanId = 'free') {
  const entitlements = useMemo(() => getEntitlements(planId), [planId])

  const can = (feature: EntitlementKey): boolean => {
    return hasEntitlement(planId, feature)
  }

  return { entitlements, can, planId, isPro: planId === 'pro' }
}
