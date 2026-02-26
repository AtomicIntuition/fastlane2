import Stripe from 'stripe'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils/id'
import { nowUtc } from '@/lib/utils/dates'

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

/**
 * Convert a Stripe Unix timestamp (seconds) to milliseconds for storage.
 * Returns null if the input is null or undefined.
 */
function stripeTs(seconds: number | null | undefined): number | null {
  return seconds ? seconds * 1000 : null
}

/**
 * Extract the Stripe subscription ID from an invoice.
 * In Stripe SDK v20+ the subscription lives under parent.subscription_details.
 */
function extractSubscriptionId(invoice: Stripe.Invoice): string | null {
  const details = invoice.parent?.subscription_details
  if (!details) return null
  const sub = details.subscription
  return typeof sub === 'string' ? sub : sub?.id ?? null
}

/**
 * Look up the subscription record for a given Stripe subscription ID.
 */
async function findBySubscriptionId(stripeSubscriptionId: string) {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
  return row ?? undefined
}

/* ================================================================== */
/*  checkout.session.completed                                         */
/* ================================================================== */

/**
 * Handle a completed Stripe Checkout session.
 *
 * Creates or updates the subscription record in the database. The userId
 * is read from `client_reference_id` which we set when creating the
 * checkout session.
 *
 * This handler is idempotent: if a subscription record already exists for
 * the user it is updated rather than duplicated.
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.client_reference_id
  if (!userId) {
    console.warn('[webhook] checkout.session.completed: missing client_reference_id')
    return
  }

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null

  // Extract price ID from the first line item if available
  const priceId = session.line_items?.data?.[0]?.price?.id ?? null

  const now = nowUtc()

  // Check if a subscription row already exists for this user
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))

  if (existing) {
    // Update the existing record (idempotent)
    await db
      .update(subscriptions)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        status: 'active',
        updatedAt: now,
      })
      .where(eq(subscriptions.userId, userId))
  } else {
    // Insert a new subscription record
    await db.insert(subscriptions).values({
      id: generateId(),
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
  }

  console.log(
    `[webhook] checkout.session.completed: userId=${userId} subscriptionId=${subscriptionId}`,
  )
}

/* ================================================================== */
/*  customer.subscription.updated                                      */
/* ================================================================== */

/**
 * Handle a Stripe subscription update event.
 *
 * Syncs status, period dates, cancel-at-period-end, and the active price
 * back to the database.
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const existing = await findBySubscriptionId(subscription.id)
  if (!existing) {
    console.warn(
      `[webhook] customer.subscription.updated: no record for subscription ${subscription.id}`,
    )
    return
  }

  const priceId = subscription.items.data[0]?.price?.id ?? existing.stripePriceId

  await db
    .update(subscriptions)
    .set({
      status: mapStripeStatus(subscription.status),
      stripePriceId: priceId,
      currentPeriodStart: stripeTs(subscription.items.data[0]?.current_period_start),
      currentPeriodEnd: stripeTs(subscription.items.data[0]?.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0,
      updatedAt: nowUtc(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))

  console.log(
    `[webhook] customer.subscription.updated: subscriptionId=${subscription.id} status=${subscription.status}`,
  )
}

/* ================================================================== */
/*  customer.subscription.deleted                                      */
/* ================================================================== */

/**
 * Handle a deleted (canceled) Stripe subscription.
 *
 * Marks the subscription as canceled in the database.
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const existing = await findBySubscriptionId(subscription.id)
  if (!existing) {
    console.warn(
      `[webhook] customer.subscription.deleted: no record for subscription ${subscription.id}`,
    )
    return
  }

  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      cancelAtPeriodEnd: 0,
      updatedAt: nowUtc(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))

  console.log(
    `[webhook] customer.subscription.deleted: subscriptionId=${subscription.id}`,
  )
}

/* ================================================================== */
/*  invoice.paid                                                       */
/* ================================================================== */

/**
 * Handle a paid invoice.
 *
 * Updates the current period end date when a recurring payment succeeds,
 * and ensures the subscription status is active.
 */
export async function handleInvoicePaid(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subscriptionId = extractSubscriptionId(invoice)

  if (!subscriptionId) {
    // One-off invoices or invoices without a subscription are ignored
    return
  }

  const existing = await findBySubscriptionId(subscriptionId)
  if (!existing) {
    console.warn(
      `[webhook] invoice.paid: no record for subscription ${subscriptionId}`,
    )
    return
  }

  // The invoice's `lines` contain the period data for the subscription
  const periodEnd = invoice.lines?.data?.[0]?.period?.end ?? null

  await db
    .update(subscriptions)
    .set({
      status: 'active',
      currentPeriodEnd: stripeTs(periodEnd),
      updatedAt: nowUtc(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))

  console.log(
    `[webhook] invoice.paid: subscriptionId=${subscriptionId} periodEnd=${periodEnd}`,
  )
}

/* ================================================================== */
/*  invoice.payment_failed                                             */
/* ================================================================== */

/**
 * Handle a failed invoice payment.
 *
 * Marks the subscription as past_due so the app can prompt the user to
 * update their payment method.
 */
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subscriptionId = extractSubscriptionId(invoice)

  if (!subscriptionId) {
    return
  }

  const existing = await findBySubscriptionId(subscriptionId)
  if (!existing) {
    console.warn(
      `[webhook] invoice.payment_failed: no record for subscription ${subscriptionId}`,
    )
    return
  }

  await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: nowUtc(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))

  console.log(
    `[webhook] invoice.payment_failed: subscriptionId=${subscriptionId}`,
  )
}

/* ================================================================== */
/*  Utility: map Stripe status to our DB enum                          */
/* ================================================================== */

function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status,
): 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' {
  switch (stripeStatus) {
    case 'active':
      return 'active'
    case 'canceled':
      return 'canceled'
    case 'past_due':
      return 'past_due'
    case 'trialing':
      return 'trialing'
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete'
    case 'unpaid':
      return 'past_due'
    case 'paused':
      return 'active'
    default:
      return 'incomplete'
  }
}
