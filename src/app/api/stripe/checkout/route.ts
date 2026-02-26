import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { stripe } from '@/lib/stripe/client'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils/id'
import { nowUtc } from '@/lib/utils/dates'
import { PRO_PLAN } from '@/lib/stripe/plans'

/* ================================================================== */
/*  POST /api/stripe/checkout                                          */
/*                                                                     */
/*  Creates a Stripe Checkout Session for a Pro subscription.          */
/*  Requires authenticated user.                                       */
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
    const userEmail = session.user.email

    /* -------------------------------------------------------------- */
    /*  Parse request body                                             */
    /* -------------------------------------------------------------- */
    const body = await request.json()
    const { priceId, interval } = body as {
      priceId?: string
      interval?: 'monthly' | 'yearly'
    }

    // Determine the Stripe price ID to use
    const resolvedPriceId =
      priceId ??
      (interval === 'yearly'
        ? PRO_PLAN.stripePriceIdYearly
        : PRO_PLAN.stripePriceIdMonthly)

    if (!resolvedPriceId) {
      return NextResponse.json(
        { error: 'No price ID configured. Check STRIPE_PRO_MONTHLY_PRICE_ID / STRIPE_PRO_YEARLY_PRICE_ID env vars.' },
        { status: 400 },
      )
    }

    /* -------------------------------------------------------------- */
    /*  Resolve or create Stripe customer                              */
    /* -------------------------------------------------------------- */
    let stripeCustomerId: string | null = null

    // Check for an existing subscription record with a stored customer ID
    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .get()

    if (existingSub?.stripeCustomerId) {
      stripeCustomerId = existingSub.stripeCustomerId
    } else {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail ?? undefined,
        metadata: { userId },
      })
      stripeCustomerId = customer.id

      // Persist the customer ID so we can reuse it later
      if (existingSub) {
        await db
          .update(subscriptions)
          .set({ stripeCustomerId, updatedAt: nowUtc() })
          .where(eq(subscriptions.userId, userId))
      } else {
        await db.insert(subscriptions).values({
          id: generateId(),
          userId,
          stripeCustomerId,
          status: 'incomplete',
          createdAt: nowUtc(),
          updatedAt: nowUtc(),
        })
      }
    }

    /* -------------------------------------------------------------- */
    /*  Build the base URL for redirects                                */
    /* -------------------------------------------------------------- */
    const origin =
      request.headers.get('origin') ??
      process.env.NEXTAUTH_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      'http://localhost:3000'

    /* -------------------------------------------------------------- */
    /*  Create Stripe Checkout Session                                  */
    /* -------------------------------------------------------------- */
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: userId,
      customer: stripeCustomerId,
      line_items: [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/upgrade`,
      subscription_data: {
        metadata: { userId },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('[api/stripe/checkout] Error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
