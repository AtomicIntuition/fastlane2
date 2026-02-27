import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getActiveSession } from '@/lib/fasting/session-manager'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activeSession = await getActiveSession(session.user.id)

    return NextResponse.json({ data: activeSession })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch active session'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
