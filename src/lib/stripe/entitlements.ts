import type { PlanId } from './plans'

export interface Entitlements {
  maxProtocols: number
  customProtocol: boolean
  unlimitedHistory: boolean
  advancedStats: boolean
  calendarHeatmap: boolean
  trendCharts: boolean
  weeklySummary: boolean
  prioritySupport: boolean
}

const ENTITLEMENTS_MAP: Record<PlanId, Entitlements> = {
  free: {
    maxProtocols: 4,
    customProtocol: false,
    unlimitedHistory: false,
    advancedStats: false,
    calendarHeatmap: false,
    trendCharts: false,
    weeklySummary: false,
    prioritySupport: false,
  },
  pro: {
    maxProtocols: Infinity,
    customProtocol: true,
    unlimitedHistory: true,
    advancedStats: true,
    calendarHeatmap: true,
    trendCharts: true,
    weeklySummary: true,
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
