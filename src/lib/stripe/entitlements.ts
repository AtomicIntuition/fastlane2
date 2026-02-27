import type { PlanId } from './plans'

export interface Entitlements {
  maxProtocols: number
  customProtocol: boolean
  unlimitedHistory: boolean
  prioritySupport: boolean
}

const ENTITLEMENTS_MAP: Record<PlanId, Entitlements> = {
  free: {
    maxProtocols: 4,
    customProtocol: false,
    unlimitedHistory: false,
    prioritySupport: false,
  },
  pro: {
    maxProtocols: Infinity,
    customProtocol: true,
    unlimitedHistory: true,
    prioritySupport: true,
  },
}

export function getEntitlements(planId: PlanId): Entitlements {
  return ENTITLEMENTS_MAP[planId] ?? ENTITLEMENTS_MAP.free
}

export type EntitlementKey = keyof Entitlements

export function hasEntitlement(planId: PlanId, feature: EntitlementKey): boolean {
  const entitlements = getEntitlements(planId)
  return !!entitlements[feature]
}
