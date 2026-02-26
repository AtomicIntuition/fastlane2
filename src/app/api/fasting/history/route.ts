import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getSessionHistory } from '@/lib/fasting/session-manager'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      Math.max(1, Number(searchParams.get('limit')) || 50),
      200,
    )
    const offset = Math.max(0, Number(searchParams.get('offset')) || 0)

    const history = await getSessionHistory(session.user.id, limit, offset)

    return NextResponse.json({ data: history })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch history'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
