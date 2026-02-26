import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { db } from '@/db'
import { fastingSessions, userProfiles } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { generateNotificationPlan } from '@/lib/fasting/notifications'
import { nowUtc } from '@/lib/utils/dates'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  // Fetch active session
  const [activeSession] = await db
    .select()
    .from(fastingSessions)
    .where(and(eq(fastingSessions.userId, userId), eq(fastingSessions.status, 'active')))

  // Fetch user profile
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))

  // Find last completed session
  const lastCompleted = await db
    .select()
    .from(fastingSessions)
    .where(and(eq(fastingSessions.userId, userId), eq(fastingSessions.status, 'completed')))
    .orderBy(desc(fastingSessions.actualEndAt))
    .limit(1)

  const lastCompletedAt = lastCompleted[0]?.actualEndAt ?? null

  const now = nowUtc()
  const plan = generateNotificationPlan(
    activeSession
      ? {
          id: activeSession.id,
          startedAt: activeSession.startedAt,
          targetEndAt: activeSession.targetEndAt,
          fastingHours: activeSession.fastingHours,
          status: activeSession.status as 'active',
        }
      : null,
    profile ?? {},
    now,
    lastCompletedAt,
  )

  return NextResponse.json({ data: plan })
}
