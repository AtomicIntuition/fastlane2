import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from '@/lib/stripe/webhook-handlers'
import type Stripe from 'stripe'

/* ================================================================== */
/*  POST /api/stripe/webhook                                           */
/*                                                                     */
/*  Stripe webhook endpoint. No auth -- verification is done via the   */
/*  webhook signature using STRIPE_WEBHOOK_SECRET.                     */
/* ================================================================== */

export async function POST(request: Request) {
  let event: Stripe.Event

  /* ---------------------------------------------------------------- */
  /*  Verify the webhook signature                                     */
  /* ---------------------------------------------------------------- */
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Webhook signature verification failed'
    console.error(`[webhook] Signature verification failed: ${message}`)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  /* ---------------------------------------------------------------- */
  /*  Log all events for debugging                                     */
  /* ---------------------------------------------------------------- */
  console.log(`[webhook] Received event: ${event.type} (${event.id})`)

  /* ---------------------------------------------------------------- */
  /*  Route to the appropriate handler                                 */
  /* ---------------------------------------------------------------- */
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    // Log the error but still return 200 to prevent Stripe from retrying
    // endlessly. The error is logged so we can investigate.
    console.error(`[webhook] Error handling ${event.type}:`, error)
  }

  /* ---------------------------------------------------------------- */
  /*  Always return 200 to acknowledge receipt                         */
  /* ---------------------------------------------------------------- */
  return NextResponse.json({ received: true })
}
