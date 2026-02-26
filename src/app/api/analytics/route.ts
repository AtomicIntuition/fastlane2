import { NextResponse } from 'next/server'
import { db } from '@/db'
import { analyticsEvents } from '@/db/schema'
import { generateId } from '@/lib/utils/id'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, properties, userId, sessionId, timestamp } = body

    if (!event || !timestamp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    db.insert(analyticsEvents)
      .values({
        id: generateId(),
        event,
        properties: properties ? JSON.stringify(properties) : null,
        userId: userId ?? null,
        sessionId: sessionId ?? null,
        timestamp,
      })
      .run()

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}
