import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { db } from '@/db'
import { userProfiles, subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { AppShell, type AppUser } from '@/components/layout/AppShell'
import type { PlanId } from '@/lib/stripe/plans'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  /* ---------------------------------------------------------------- */
  /*  Auth gate                                                        */
  /* ---------------------------------------------------------------- */
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id

  /* ---------------------------------------------------------------- */
  /*  Fetch user profile + subscription in parallel                    */
  /* ---------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------- */
  /*  Onboarding redirect                                              */
  /* ---------------------------------------------------------------- */
  if (!profile?.onboardingCompleted) {
    redirect('/onboarding')
  }

  /* ---------------------------------------------------------------- */
  /*  Determine plan                                                   */
  /* ---------------------------------------------------------------- */
  const planId: PlanId =
    subscription?.status === 'active' || subscription?.status === 'trialing'
      ? 'pro'
      : 'free'

  /* ---------------------------------------------------------------- */
  /*  Build user object for the client shell                           */
  /* ---------------------------------------------------------------- */
  const user: AppUser = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  }

  return (
    <AppShell user={user} planId={planId}>
      {children}
    </AppShell>
  )
}
