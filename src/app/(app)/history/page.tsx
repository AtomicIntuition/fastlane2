import type { Metadata } from 'next'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getSessionHistory } from '@/lib/fasting/session-manager'
import { HistoryContent } from './HistoryContent'
import type { FastingSessionData } from '@/hooks/use-fasting-session'

export const metadata: Metadata = {
  title: 'History',
}

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const rawHistory = await getSessionHistory(session.user.id, 100)

  const history: FastingSessionData[] = rawHistory.map((s) => ({
    id: s.id,
    userId: s.userId,
    protocol: s.protocol,
    fastingHours: s.fastingHours,
    eatingHours: s.eatingHours,
    startedAt: s.startedAt,
    targetEndAt: s.targetEndAt,
    actualEndAt: s.actualEndAt,
    status: s.status ?? 'active',
    notes: s.notes,
    createdAt: s.createdAt ?? 0,
  }))

  return <HistoryContent initialSessions={history} />
}
