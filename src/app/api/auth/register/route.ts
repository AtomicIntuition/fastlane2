import { NextResponse } from 'next/server'
import { hashSync } from 'bcryptjs'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { registerSchema } from '@/lib/utils/validation'
import { generateId } from '@/lib/utils/id'
import { nowUtc } from '@/lib/utils/dates'
import { validateCsrfRequest } from '@/lib/security/csrf'

export async function POST(request: Request) {
  try {
    if (!validateCsrfRequest(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    // Check if user exists
    const [existing] = await db.select().from(users).where(eq(users.email, email))
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = hashSync(password, 12)
    const now = nowUtc()

    await db.insert(users)
      .values({
        id: generateId(),
        name,
        email,
        passwordHash,
        createdAt: now,
        updatedAt: now,
      })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
