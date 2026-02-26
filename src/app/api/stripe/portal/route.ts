import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { stripe } from '@/lib/stripe/client'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'

/* ================================================================== */
/*  POST /api/stripe/portal                                            */
/*                                                                     */
/*  Creates a Stripe Customer Portal session so the user can manage    */
/*  their subscription, update payment methods, or cancel.             */
/*  Requires authenticated user with an existing Stripe customer ID.   */
/* ================================================================== */

export async function POST(request: Request) {
  try {
    /* -------------------------------------------------------------- */
    /*  Auth check                                                     */
    /* -------------------------------------------------------------- */
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    /* -------------------------------------------------------------- */
    /*  Look up the Stripe customer ID                                 */
    /* -------------------------------------------------------------- */
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .get()

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 },
      )
    }

    /* -------------------------------------------------------------- */
    /*  Build the return URL                                            */
    /* -------------------------------------------------------------- */
    const origin =
      request.headers.get('origin') ??
      process.env.NEXTAUTH_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      'http://localhost:3000'

    /* -------------------------------------------------------------- */
    /*  Create Stripe Portal Session                                    */
    /* -------------------------------------------------------------- */
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('[api/stripe/portal] Error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to create portal session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
