import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { cancelFast } from '@/lib/fasting/session-manager'
import { validateCsrfRequest } from '@/lib/security/csrf'

export async function POST(request: Request) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = body as { sessionId?: string }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 },
      )
    }

    const fastingSession = await cancelFast(session.user.id, sessionId)

    return NextResponse.json({ data: fastingSession })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to cancel fast'
    const status = message.includes('not found')
      ? 404
      : message.includes('not active')
        ? 409
        : 500

    return NextResponse.json({ error: message }, { status })
  }
}
