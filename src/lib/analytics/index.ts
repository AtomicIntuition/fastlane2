import type { AnalyticsProvider, AnalyticsEvent } from './types'
import { nowUtc } from '@/lib/utils/dates'
import { generateId } from '@/lib/utils/id'

class AnalyticsBus {
  private providers: AnalyticsProvider[] = []
  private sessionId: string = generateId()

  addProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider)
  }

  removeProvider(name: string): void {
    this.providers = this.providers.filter((p) => p.name !== name)
  }

  track(event: string, properties?: Record<string, unknown>, userId?: string): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      userId,
      sessionId: this.sessionId,
      timestamp: nowUtc(),
    }

    for (const provider of this.providers) {
      try {
        provider.track(analyticsEvent)
      } catch {
        // Never let analytics break the app
      }
    }
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    for (const provider of this.providers) {
      try {
        provider.identify?.(userId, traits)
      } catch {
        // Silent fail
      }
    }
  }

  page(name: string, properties?: Record<string, unknown>): void {
    for (const provider of this.providers) {
      try {
        provider.page?.(name, properties)
      } catch {
        // Silent fail
      }
    }
  }
}

export const analytics = new AnalyticsBus()

export { EVENTS } from './types'
export type { AnalyticsProvider, AnalyticsEvent } from './types'
