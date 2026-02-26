import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { checkinSchema } from '@/lib/utils/validation'
import { db } from '@/db'
import { dailyCheckins } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils/id'
import { nowUtc, toDateString } from '@/lib/utils/dates'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = checkinSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const now = nowUtc()
    const id = generateId()

    // Extract optional fastingSessionId from the request body
    const { fastingSessionId } = body as { fastingSessionId?: string }

    await db.insert(dailyCheckins)
      .values({
        id,
        userId: session.user.id,
        fastingSessionId: fastingSessionId ?? null,
        date: toDateString(now),
        mood: parsed.data.mood,
        hungerLevel: parsed.data.hungerLevel,
        energyLevel: parsed.data.energyLevel,
        notes: parsed.data.notes ?? null,
        createdAt: now,
      })

    const checkin = await db
      .select()
      .from(dailyCheckins)
      .where(eq(dailyCheckins.id, id))
      .get()

    return NextResponse.json({ data: checkin }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save check-in'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
