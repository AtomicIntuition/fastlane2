import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { startFastSchema } from '@/lib/utils/validation'
import { startFast } from '@/lib/fasting/session-manager'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = startFastSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const fastingSession = await startFast(session.user.id, parsed.data.protocol)

    return NextResponse.json({ data: fastingSession }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to start fast'
    const status = message.includes('already have an active') ? 409 : 500

    return NextResponse.json({ error: message }, { status })
  }
}
