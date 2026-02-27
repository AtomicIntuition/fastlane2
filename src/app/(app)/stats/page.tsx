import type { Metadata } from 'next'
import { auth } from '@/lib/auth/auth'
import { db } from '@/db'
import { fastingSessions } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { calculateStreaks, type StreakResult } from '@/lib/fasting/streaks'
import { nowUtc, toDateString } from '@/lib/utils/dates'
import { StatsContent } from './StatsContent'
import type { WeekData } from '@/components/stats/WeeklySummary'
import type { TrendDataPoint } from '@/components/stats/TrendChart'
import type { HeatmapDay } from '@/components/stats/CalendarHeatmap'

export const metadata: Metadata = {
  title: 'Stats',
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekBounds(now: number, weeksAgo: number) {
  const date = new Date(now)
  // Adjust to start of current week (Sunday)
  const dayOfWeek = date.getUTCDay()
  const startOfWeek = new Date(date)
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - dayOfWeek - weeksAgo * 7)
  startOfWeek.setUTCHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 7)

  return { start: startOfWeek.getTime(), end: endOfWeek.getTime() }
}

function buildWeekData(
  sessions: { startedAt: number; actualEndAt: number | null; fastingHours: number; status: string | null }[],
  start: number,
  end: number,
): WeekData {
  const completed = sessions.filter(
    (s) =>
      s.status === 'completed' &&
      s.startedAt >= start &&
      s.startedAt < end,
  )

  const totalFasts = completed.length
  const totalHours = completed.reduce((sum, s) => sum + s.fastingHours, 0)
  const avgDuration = totalFasts > 0 ? Math.round((totalHours / totalFasts) * 10) / 10 : 0

  return { totalHours, totalFasts, avgDuration }
}

/* ------------------------------------------------------------------ */
/*  Empty data for guests                                              */
/* ------------------------------------------------------------------ */

const EMPTY_STREAKS: StreakResult = { currentStreak: 0, longestStreak: 0, totalCompleted: 0, completionRate: 0 }
const EMPTY_WEEK: WeekData = { totalHours: 0, totalFasts: 0, avgDuration: 0 }

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function StatsPage() {
  const session = await auth().catch(() => null)

  if (!session?.user?.id) {
    // Guest — show empty stats (UI still fully visible)
    return (
      <StatsContent
        streaks={EMPTY_STREAKS}
        thisWeek={EMPTY_WEEK}
        lastWeek={EMPTY_WEEK}
        trendData={DAY_LABELS.slice(-7).map((day) => ({ day, hours: 0 }))}
        heatmapData={[]}
      />
    )
  }

  const userId = session.user.id
  const now = nowUtc()

  /* ---- Fetch all sessions for the user ---- */
  const allSessions = await db
    .select()
    .from(fastingSessions)
    .where(eq(fastingSessions.userId, userId))
    .orderBy(desc(fastingSessions.createdAt))
    .limit(365)

  /* ---- Streaks ---- */
  const completedSessions = allSessions
    .filter((s) => s.status === 'completed' && s.actualEndAt !== null)
    .map((s) => ({ actualEndAt: s.actualEndAt! }))

  const streaks: StreakResult = calculateStreaks(completedSessions, now)

  /* ---- Weekly data ---- */
  const thisWeekBounds = getWeekBounds(now, 0)
  const lastWeekBounds = getWeekBounds(now, 1)

  const thisWeek: WeekData = buildWeekData(allSessions, thisWeekBounds.start, thisWeekBounds.end)
  const lastWeek: WeekData = buildWeekData(allSessions, lastWeekBounds.start, lastWeekBounds.end)

  /* ---- Trend data (last 7 days) ---- */
  const trendData: TrendDataPoint[] = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setUTCDate(dayStart.getUTCDate() - i)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1)

    const dayLabel = DAY_LABELS[dayStart.getUTCDay()]
    const daySessions = allSessions.filter(
      (s) =>
        s.status === 'completed' &&
        s.startedAt >= dayStart.getTime() &&
        s.startedAt < dayEnd.getTime(),
    )
    const hours = daySessions.reduce((sum, s) => sum + s.fastingHours, 0)

    trendData.push({ day: dayLabel, hours })
  }

  /* ---- Heatmap data ---- */
  const heatmapData: HeatmapDay[] = (() => {
    const map = new Map<string, number>()
    for (const s of allSessions) {
      if (s.status !== 'completed' || !s.actualEndAt) continue
      const dateStr = toDateString(s.actualEndAt)
      map.set(dateStr, (map.get(dateStr) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }))
  })()

  return (
    <StatsContent
      streaks={streaks}
      thisWeek={thisWeek}
      lastWeek={lastWeek}
      trendData={trendData}
      heatmapData={heatmapData}
    />
  )
}
