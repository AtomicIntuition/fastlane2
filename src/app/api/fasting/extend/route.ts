import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { extendFast } from '@/lib/fasting/session-manager'
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
    const { sessionId, additionalHours } = body as {
      sessionId?: string
      additionalHours?: number
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 },
      )
    }

    if (
      additionalHours === undefined ||
      typeof additionalHours !== 'number' ||
      additionalHours <= 0 ||
      additionalHours > 24
    ) {
      return NextResponse.json(
        { error: 'additionalHours must be a number between 1 and 24' },
        { status: 400 },
      )
    }

    const fastingSession = await extendFast(
      session.user.id,
      sessionId,
      additionalHours,
    )

    return NextResponse.json({ data: fastingSession })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to extend fast'
    const status = message.includes('not found')
      ? 404
      : message.includes('not active')
        ? 409
        : 500

    return NextResponse.json({ error: message }, { status })
  }
}
