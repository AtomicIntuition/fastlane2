import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { db } from '@/db'
import { users, subscriptions, fastingSessions } from '@/db/schema'
import { eq, count, sql, and, gte } from 'drizzle-orm'

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

interface CheckItem {
  name: string
  ok: boolean
}

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect('/dashboard')
  }

  // Service readiness checks
  const serviceChecks: CheckItem[] = [
    { name: 'AUTH_SECRET', ok: !!process.env.AUTH_SECRET },
    { name: 'STRIPE_SECRET_KEY', ok: !!process.env.STRIPE_SECRET_KEY },
    { name: 'SENTRY_DSN', ok: !!process.env.SENTRY_DSN },
    { name: 'DATABASE_URL', ok: !!process.env.DATABASE_URL },
  ]

  // User count
  const [userCount] = await db.select({ count: count() }).from(users)

  // Subscription stats
  const activeSubs = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'))
  const totalSubs = await db.select({ count: count() }).from(subscriptions)

  // Recent sessions (last 24 hours)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  const recentSessions = await db
    .select({ count: count() })
    .from(fastingSessions)
    .where(gte(fastingSessions.createdAt, oneDayAgo))

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      {/* Service Readiness */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Service Readiness</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {serviceChecks.map((check) => (
            <div
              key={check.name}
              className={`rounded-lg border p-4 ${
                check.ok
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                  : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
              }`}
            >
              <p className="text-sm font-medium">{check.name}</p>
              <p className={`text-xs mt-1 ${check.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {check.ok ? 'Configured' : 'Missing'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Platform Stats</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Users" value={userCount.count} />
          <StatCard label="Active Subs" value={activeSubs[0].count} />
          <StatCard label="Total Subs" value={totalSubs[0].count} />
          <StatCard label="Sessions (24h)" value={recentSessions[0].count} />
        </div>
      </section>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-sm text-foreground-secondary">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
