import { NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

interface HealthCheck {
  name: string
  status: 'pass' | 'fail'
  message?: string
}

export async function GET() {
  const checks: HealthCheck[] = []

  // Database connectivity
  try {
    await db.execute(sql`SELECT 1`)
    checks.push({ name: 'database', status: 'pass' })
  } catch (e) {
    checks.push({
      name: 'database',
      status: 'fail',
      message: e instanceof Error ? e.message : 'DB unreachable',
    })
  }

  // AUTH_SECRET set
  checks.push({
    name: 'auth_secret',
    status: process.env.AUTH_SECRET ? 'pass' : 'fail',
    ...(process.env.AUTH_SECRET ? {} : { message: 'AUTH_SECRET not set' }),
  })

  // STRIPE_SECRET_KEY set
  checks.push({
    name: 'stripe_key',
    status: process.env.STRIPE_SECRET_KEY ? 'pass' : 'fail',
    ...(process.env.STRIPE_SECRET_KEY ? {} : { message: 'STRIPE_SECRET_KEY not set' }),
  })

  // SENTRY_DSN set (optional — degraded if missing)
  checks.push({
    name: 'sentry_dsn',
    status: process.env.SENTRY_DSN ? 'pass' : 'fail',
    ...(process.env.SENTRY_DSN ? {} : { message: 'SENTRY_DSN not set' }),
  })

  const allPass = checks.every((c) => c.status === 'pass')
  const anyFail = checks.some(
    (c) => c.status === 'fail' && c.name !== 'sentry_dsn', // Sentry is optional
  )

  const status = anyFail ? 'degraded' : allPass ? 'ok' : 'degraded'

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: status === 'ok' || status === 'degraded' ? 200 : 503 },
  )
}
