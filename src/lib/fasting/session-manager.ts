import { db } from '@/db'
import { fastingSessions } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { generateId } from '@/lib/utils/id'
import { nowUtc } from '@/lib/utils/dates'
import { getProtocol } from './protocols'

export async function startFast(userId: string, protocolId: string, customHours?: { fasting: number; eating: number }) {
  const [active] = await db
    .select()
    .from(fastingSessions)
    .where(and(eq(fastingSessions.userId, userId), eq(fastingSessions.status, 'active')))

  if (active) {
    throw new Error('You already have an active fasting session')
  }

  const protocol = getProtocol(protocolId)
  const fastingHours = customHours?.fasting ?? protocol?.fastingHours ?? 16
  const eatingHours = customHours?.eating ?? protocol?.eatingHours ?? 8

  const now = nowUtc()
  const targetEnd = now + fastingHours * 60 * 60 * 1000

  const id = generateId()
  await db.insert(fastingSessions)
    .values({
      id,
      userId,
      protocol: protocolId,
      fastingHours,
      eatingHours,
      startedAt: now,
      targetEndAt: targetEnd,
      status: 'active',
      createdAt: now,
    })

  const [created] = await db.select().from(fastingSessions).where(eq(fastingSessions.id, id))
  return created!
}

export async function completeFast(userId: string, sessionId: string) {
  const [session] = await db
    .select()
    .from(fastingSessions)
    .where(and(eq(fastingSessions.id, sessionId), eq(fastingSessions.userId, userId)))

  if (!session) throw new Error('Session not found')
  if (session.status !== 'active') throw new Error('Session is not active')

  const now = nowUtc()

  await db.update(fastingSessions)
    .set({ status: 'completed', actualEndAt: now })
    .where(eq(fastingSessions.id, sessionId))

  const [updated] = await db.select().from(fastingSessions).where(eq(fastingSessions.id, sessionId))
  return updated!
}

export async function cancelFast(userId: string, sessionId: string) {
  const [session] = await db
    .select()
    .from(fastingSessions)
    .where(and(eq(fastingSessions.id, sessionId), eq(fastingSessions.userId, userId)))

  if (!session) throw new Error('Session not found')
  if (session.status !== 'active') throw new Error('Session is not active')

  const now = nowUtc()

  await db.update(fastingSessions)
    .set({ status: 'cancelled', actualEndAt: now })
    .where(eq(fastingSessions.id, sessionId))

  const [updated] = await db.select().from(fastingSessions).where(eq(fastingSessions.id, sessionId))
  return updated!
}

export async function getActiveSession(userId: string) {
  const [session] = await db
    .select()
    .from(fastingSessions)
    .where(and(eq(fastingSessions.userId, userId), eq(fastingSessions.status, 'active')))
  return session ?? null
}

export async function getSessionHistory(userId: string, limit = 50, offset = 0) {
  return db
    .select()
    .from(fastingSessions)
    .where(eq(fastingSessions.userId, userId))
    .orderBy(desc(fastingSessions.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function addWater(userId: string, sessionId: string) {
  const [session] = await db
    .select()
    .from(fastingSessions)
    .where(and(eq(fastingSessions.id, sessionId), eq(fastingSessions.userId, userId)))

  if (!session) throw new Error('Session not found')
  if (session.status !== 'active') throw new Error('Session is not active')

  const newCount = (session.waterGlasses ?? 0) + 1

  await db.update(fastingSessions)
    .set({ waterGlasses: newCount })
    .where(eq(fastingSessions.id, sessionId))

  const [updated] = await db.select().from(fastingSessions).where(eq(fastingSessions.id, sessionId))
  return updated!
}

export async function removeWater(userId: string, sessionId: string) {
  const [session] = await db
    .select()
    .from(fastingSessions)
    .where(and(eq(fastingSessions.id, sessionId), eq(fastingSessions.userId, userId)))

  if (!session) throw new Error('Session not found')
  if (session.status !== 'active') throw new Error('Session is not active')

  const newCount = Math.max(0, (session.waterGlasses ?? 0) - 1)

  await db.update(fastingSessions)
    .set({ waterGlasses: newCount })
    .where(eq(fastingSessions.id, sessionId))

  const [updated] = await db.select().from(fastingSessions).where(eq(fastingSessions.id, sessionId))
  return updated!
}

export async function extendFast(userId: string, sessionId: string, additionalHours: number) {
  const [session] = await db
    .select()
    .from(fastingSessions)
    .where(and(eq(fastingSessions.id, sessionId), eq(fastingSessions.userId, userId)))

  if (!session) throw new Error('Session not found')
  if (session.status !== 'active') throw new Error('Session is not active')

  const newTarget = session.targetEndAt + additionalHours * 60 * 60 * 1000

  await db.update(fastingSessions)
    .set({
      targetEndAt: newTarget,
      fastingHours: session.fastingHours + additionalHours,
    })
    .where(eq(fastingSessions.id, sessionId))

  const [updated] = await db.select().from(fastingSessions).where(eq(fastingSessions.id, sessionId))
  return updated!
}
