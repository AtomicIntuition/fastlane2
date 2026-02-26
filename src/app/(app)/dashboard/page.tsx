import type { Metadata } from 'next'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getActiveSession, getSessionHistory } from '@/lib/fasting/session-manager'
import { calculateStreaks } from '@/lib/fasting/streaks'
import { nowUtc } from '@/lib/utils/dates'
import { DashboardContent } from './DashboardContent'
import type { FastingSessionData } from '@/hooks/use-fasting-session'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id

  /* ---------------------------------------------------------------- */
  /*  Fetch data in parallel                                           */
  /* ---------------------------------------------------------------- */
  const [activeSessionRaw, history] = await Promise.all([
    getActiveSession(userId),
    getSessionHistory(userId, 50),
  ])

  /* ---------------------------------------------------------------- */
  /*  Normalize to client-safe types                                   */
  /* ---------------------------------------------------------------- */
  const activeSession: FastingSessionData | null = activeSessionRaw
    ? {
        id: activeSessionRaw.id,
        userId: activeSessionRaw.userId,
        protocol: activeSessionRaw.protocol,
        fastingHours: activeSessionRaw.fastingHours,
        eatingHours: activeSessionRaw.eatingHours,
        startedAt: activeSessionRaw.startedAt,
        targetEndAt: activeSessionRaw.targetEndAt,
        actualEndAt: activeSessionRaw.actualEndAt,
        status: activeSessionRaw.status ?? 'active',
        waterGlasses: activeSessionRaw.waterGlasses ?? 0,
        notes: activeSessionRaw.notes,
        createdAt: activeSessionRaw.createdAt ?? 0,
      }
    : null

  /* ---------------------------------------------------------------- */
  /*  Calculate streaks from completed sessions                        */
  /* ---------------------------------------------------------------- */
  const completedSessions = history
    .filter((s) => s.status === 'completed' && s.actualEndAt !== null)
    .map((s) => ({ actualEndAt: s.actualEndAt! }))

  const streaks = calculateStreaks(completedSessions, nowUtc())

  return (
    <DashboardContent
      initialActiveSession={activeSession}
      streaks={streaks}
    />
  )
}
