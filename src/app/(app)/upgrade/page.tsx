import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { UpgradeContent } from './UpgradeContent'

export const metadata: Metadata = {
  title: 'Upgrade to Pro',
}

export default async function UpgradePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id

  /* ---------------------------------------------------------------- */
  /*  Check existing subscription                                      */
  /* ---------------------------------------------------------------- */
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))

  const isProActive =
    subscription?.status === 'active' || subscription?.status === 'trialing'

  return (
    <UpgradeContent
      isProActive={isProActive}
      cancelAtPeriodEnd={Boolean(subscription?.cancelAtPeriodEnd)}
      currentPeriodEnd={subscription?.currentPeriodEnd ?? null}
    />
  )
}
