import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { addWaterSchema } from '@/lib/utils/validation'
import { removeWater } from '@/lib/fasting/session-manager'
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
    const parsed = addWaterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const updated = await removeWater(session.user.id, parsed.data.sessionId)

    return NextResponse.json({ data: updated })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to remove water'
    const status = message.includes('not found') ? 404 : 500

    return NextResponse.json({ error: message }, { status })
  }
}
