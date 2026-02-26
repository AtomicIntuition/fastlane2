import type { Metadata } from 'next'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { userProfiles, subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { SettingsContent } from './SettingsContent'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id

  const [profile, subscription] = await Promise.all([
    db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .get(),
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .get(),
  ])

  return (
    <SettingsContent
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
      profile={
        profile
          ? {
              preferredProtocol: profile.preferredProtocol,
              timezone: profile.timezone ?? 'UTC',
              notificationsEnabled: Boolean(profile.notificationsEnabled),
            }
          : null
      }
      subscription={
        subscription
          ? {
              status: subscription.status,
              currentPeriodEnd: subscription.currentPeriodEnd,
              cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
            }
          : null
      }
    />
  )
}
