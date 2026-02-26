import type { Metadata } from 'next'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getActiveSession } from '@/lib/fasting/session-manager'
import { TimerPageContent } from './TimerPageContent'
import type { FastingSessionData } from '@/hooks/use-fasting-session'

export const metadata: Metadata = {
  title: 'Timer',
}

export default async function TimerPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const activeSessionRaw = await getActiveSession(session.user.id)

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

  return <TimerPageContent initialActiveSession={activeSession} />
}
