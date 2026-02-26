import type { AnalyticsProvider, AnalyticsEvent } from '../types'

export class ConsoleProvider implements AnalyticsProvider {
  name = 'console'

  track(event: AnalyticsEvent): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event.event, event.properties ?? {})
    }
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Identify:', userId, traits ?? {})
    }
  }

  page(name: string, properties?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page:', name, properties ?? {})
    }
  }
}
