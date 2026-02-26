/**
 * Pure function that generates a notification plan based on user state.
 * No side effects — just computes what notifications should fire and when.
 */

export type NotificationType =
  | 'fast-near-complete'
  | 'hydration-check'
  | 'fast-complete'
  | 'start-window'
  | 'reengagement'

export type NotificationPriority = 'HIGH' | 'NORMAL'

export interface Notification {
  type: NotificationType
  title: string
  body: string
  scheduledAt: number // epoch ms
  priority: NotificationPriority
}

export interface ActiveSession {
  id: string
  startedAt: number
  targetEndAt: number
  fastingHours: number
  status: 'active' | 'completed' | 'cancelled'
}

export interface UserProfile {
  timezone?: string | null
  notificationsEnabled?: number | null
  preferredProtocol?: string | null
}

const THIRTY_MINUTES = 30 * 60 * 1000
const TWO_HOURS = 2 * 60 * 60 * 1000
const THIRTY_SIX_HOURS = 36 * 60 * 60 * 1000
const MAX_NOTIFICATIONS = 5

/**
 * Generate a sorted, prioritized notification plan.
 *
 * @param activeSession - Current fasting session (or null)
 * @param profile       - User profile for preferences
 * @param now           - Current epoch ms (injection for testability)
 * @param lastCompletedAt - When the user last completed a fast (epoch ms, or null)
 */
export function generateNotificationPlan(
  activeSession: ActiveSession | null,
  profile: UserProfile,
  now: number,
  lastCompletedAt?: number | null,
): Notification[] {
  if (profile.notificationsEnabled === 0) return []

  const notifications: Notification[] = []

  if (activeSession && activeSession.status === 'active') {
    const { startedAt, targetEndAt } = activeSession

    // fast-near-complete: 30 min before target end
    const nearCompleteTime = targetEndAt - THIRTY_MINUTES
    if (nearCompleteTime > now) {
      notifications.push({
        type: 'fast-near-complete',
        title: 'Almost there!',
        body: '30 minutes left in your fast. You got this!',
        scheduledAt: nearCompleteTime,
        priority: 'HIGH',
      })
    }

    // hydration-check: 2 hours into the fast
    const hydrationTime = startedAt + TWO_HOURS
    if (hydrationTime > now) {
      notifications.push({
        type: 'hydration-check',
        title: 'Stay hydrated',
        body: 'Remember to drink water during your fast.',
        scheduledAt: hydrationTime,
        priority: 'NORMAL',
      })
    }

    // fast-complete: at target end
    if (targetEndAt > now) {
      notifications.push({
        type: 'fast-complete',
        title: 'Fast complete!',
        body: `Congratulations! Your ${activeSession.fastingHours}h fast is done.`,
        scheduledAt: targetEndAt,
        priority: 'HIGH',
      })
    }
  }

  // start-window: next day at 8am in user's timezone (simplified — uses 8 AM tomorrow UTC if no tz)
  if (!activeSession || activeSession.status !== 'active') {
    const tomorrow8am = getNext8am(now)
    notifications.push({
      type: 'start-window',
      title: 'Ready to fast?',
      body: 'Your optimal fasting window starts now.',
      scheduledAt: tomorrow8am,
      priority: 'NORMAL',
    })
  }

  // reengagement: if idle for >36h
  if (lastCompletedAt && now - lastCompletedAt > THIRTY_SIX_HOURS && !activeSession) {
    notifications.push({
      type: 'reengagement',
      title: 'We miss you!',
      body: "It's been a while since your last fast. Ready to get back on track?",
      scheduledAt: now, // Send immediately
      priority: 'HIGH',
    })
  }

  // Sort by scheduledAt, then take top MAX_NOTIFICATIONS
  return notifications
    .sort((a, b) => a.scheduledAt - b.scheduledAt)
    .slice(0, MAX_NOTIFICATIONS)
}

function getNext8am(now: number): number {
  const d = new Date(now)
  d.setUTCHours(8, 0, 0, 0)
  if (d.getTime() <= now) {
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return d.getTime()
}
