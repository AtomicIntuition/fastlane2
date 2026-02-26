import { toDateString } from '@/lib/utils/dates'

export interface StreakResult {
  currentStreak: number
  longestStreak: number
  totalCompleted: number
  completionRate: number
}

export function calculateStreaks(
  completedSessions: { actualEndAt: number }[],
  now: number
): StreakResult {
  if (completedSessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompleted: 0, completionRate: 0 }
  }

  // Get unique dates with completed fasts, sorted descending
  const dates = [...new Set(completedSessions.map((s) => toDateString(s.actualEndAt)))]
    .sort()
    .reverse()

  const totalCompleted = completedSessions.length
  const today = toDateString(now)
  const yesterday = toDateString(now - 86400000)

  // Calculate current streak
  let currentStreak = 0

  // If today has a completed fast, start counting from today
  // If not, check if yesterday has one (streak is still alive)
  if (dates.includes(today)) {
    currentStreak = 1
  } else if (dates.includes(yesterday)) {
    currentStreak = 1
  }

  if (currentStreak > 0) {
    let dayOffset = dates.includes(today) ? 1 : 2
    while (true) {
      const dateStr = toDateString(now - dayOffset * 86400000)
      if (dates.includes(dateStr)) {
        currentStreak++
        dayOffset++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let streak = 1
  const sortedDates = [...dates].sort()

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1])
    const curr = new Date(sortedDates[i])
    const diffDays = (curr.getTime() - prev.getTime()) / 86400000

    if (Math.round(diffDays) === 1) {
      streak++
    } else {
      longestStreak = Math.max(longestStreak, streak)
      streak = 1
    }
  }
  longestStreak = Math.max(longestStreak, streak)

  // Calculate completion rate (last 30 days)
  const thirtyDaysAgo = now - 30 * 86400000
  const recentSessions = completedSessions.filter((s) => s.actualEndAt >= thirtyDaysAgo)
  const completionRate = Math.round((recentSessions.length / 30) * 100)

  return { currentStreak, longestStreak, totalCompleted, completionRate }
}
