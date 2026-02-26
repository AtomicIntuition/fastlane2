import type { AnalyticsProvider, AnalyticsEvent } from '../types'

export class DatabaseProvider implements AnalyticsProvider {
  name = 'database'

  async track(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
    } catch {
      // Silently fail - analytics should never break the app
    }
  }
}
