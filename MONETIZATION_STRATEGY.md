# FastLane -- Monetization Strategy

**Version:** 1.0
**Last Updated:** 2026-02-25

---

## 1. Business Model Overview

FastLane uses a **freemium SaaS model** with a single upgrade path from Free to Pro. The free tier is deliberately generous -- it covers the full fasting lifecycle (timer, history, streaks, check-ins) so that users develop the habit before encountering any paywall. The Pro tier unlocks power-user features that deepen engagement and provide long-term analytical value.

**Core Principle:** Free users should never feel punished. Every paywall is a *door to more*, not a *wall blocking progress*.

---

## 2. Free vs Pro Tier Comparison

| Feature | Free | Pro |
|---|---|---|
| **Fasting Protocols** | 4 (12:12, 14:10, 16:8, 18:6) | All 8 + Custom (20:4, OMAD, 36h, Custom) |
| **Live Fasting Timer** | Yes | Yes |
| **Timer Notifications** | Basic | Full (start, mid-fast, completion) |
| **Daily Check-ins** | Yes | Yes |
| **Fasting History** | Last 7 days | Unlimited |
| **Streak Tracking** | Current streak only | Full stats (current, longest, completion rate) |
| **Calendar Heatmap** | -- | Yes |
| **Trend Charts & Insights** | -- | Yes |
| **Weekly Summary Reports** | -- | Yes |
| **Custom Protocols** | -- | Yes |
| **Extend Fast (+1h)** | Yes | Yes |
| **Priority Support** | -- | Yes |

### Entitlement System (Code Reference)

Feature gating is enforced through the entitlements system at `/src/lib/stripe/entitlements.ts`:

```typescript
const ENTITLEMENTS_MAP: Record<PlanId, Entitlements> = {
  free: {
    maxProtocols: 4,
    customProtocol: false,
    unlimitedHistory: false,
    advancedStats: false,
    calendarHeatmap: false,
    trendCharts: false,
    weeklySummary: false,
    prioritySupport: false,
  },
  pro: {
    maxProtocols: Infinity,
    customProtocol: true,
    unlimitedHistory: true,
    advancedStats: true,
    calendarHeatmap: true,
    trendCharts: true,
    weeklySummary: true,
    prioritySupport: true,
  },
}
```

The `useEntitlement` hook and `ProGate` component enforce gating at the UI level.

---

## 3. Pricing

| Plan | Monthly | Yearly | Monthly Equivalent (Yearly) | Savings |
|---|---|---|---|---|
| **Free** | $0 | $0 | $0 | -- |
| **Pro** | $4.99/mo | $39.99/yr | $3.33/mo | ~33% vs monthly |

### 3.1 Pricing Rationale

**$4.99/month:**
- Positioned below the $9.99/mo "premium app" threshold, minimizing purchase friction.
- Comparable to a single specialty coffee -- an easy mental anchor for health-conscious users.
- Falls within the typical range for subscription health/wellness apps ($3-$8/mo).
- Low enough that most users don't need to "think about it" -- impulse-friendly for a proven habit.

**$39.99/year:**
- Provides a ~33% discount vs monthly ($59.88/yr at monthly rate), giving a strong incentive to commit annually.
- Annual billing reduces churn (users are less likely to cancel mid-year), lowers payment processing costs, and improves cash flow predictability.
- The $39.99 price point stays under the $40 psychological threshold.
- Yearly equivalent ($3.33/mo) is displayed prominently in the pricing UI to reinforce value.

### 3.2 Why Not a Higher Price?

- FastLane is a single-purpose utility, not a comprehensive health platform. Users expect lower prices for focused tools.
- Lower price drives higher conversion volume, which builds a larger user base for word-of-mouth growth.
- There is room to introduce higher tiers later (e.g., "Coach" plan for wellness professionals) without disrupting existing pricing.

---

## 4. Feature Gating Strategy

### 4.1 Gating Philosophy

The gating strategy follows three rules:

1. **Never gate the core loop.** Starting, tracking, and completing a fast is always free.
2. **Gate depth, not breadth.** Free users get the full feature set but with limited depth (7-day history, 4 protocols, basic streaks).
3. **Make the upgrade visible but not aggressive.** Locked features appear as blurred previews with a single "Upgrade to Pro" button -- no pop-ups, no countdowns, no repeated nagging.

### 4.2 Gating Touchpoints

| Touchpoint | Free Experience | Pro Upgrade Trigger |
|---|---|---|
| **Protocol Picker** | 4 protocols visible and selectable; Pro protocols shown with lock icon | User taps a locked protocol |
| **History Page** | Shows last 7 days of fasting sessions | User scrolls past 7-day cutoff; sees "Unlock full history" |
| **Stats Page** | Current streak and total fasts only | Calendar heatmap, trend charts, weekly summary are gated behind ProGate overlay |
| **Custom Protocol** | Not available | User attempts to create a custom schedule |
| **Settings Page** | Links to upgrade page | "Your Plan: Free" with upgrade CTA |
| **Upgrade Page** | Full plan comparison with monthly/yearly toggle | Dedicated `/upgrade` route accessible from multiple entry points |

### 4.3 ProGate Component

The `ProGate` component (`/src/components/shared/ProGate.tsx`) is the universal gating UI:

- Wraps any child content in a blurred, semi-transparent overlay.
- Displays a centered card with a lock icon, "Pro Feature" heading, description of the gated feature, and a primary "Upgrade to Pro" button linking to `/upgrade`.
- Accepts `isPro` boolean and optional `feature` string for contextual messaging.

---

## 5. Stripe Integration

### 5.1 Architecture Overview

```
User clicks "Upgrade"
        |
        v
POST /api/stripe/checkout
  - Authenticates user (Auth.js session)
  - Resolves or creates Stripe customer
  - Creates Stripe Checkout Session (subscription mode)
  - Returns checkout URL
        |
        v
User completes payment on Stripe-hosted page
        |
        v
Stripe sends webhook events to POST /api/stripe/webhook
  - checkout.session.completed  -> Create/update subscription record
  - customer.subscription.updated -> Sync status, period, price
  - customer.subscription.deleted -> Mark as canceled
  - invoice.paid -> Renew period, ensure active status
  - invoice.payment_failed -> Mark as past_due
        |
        v
App reads subscription status from DB -> Entitlements resolved per request
```

### 5.2 Webhook Events Handled

| Event | Handler | Action |
|---|---|---|
| `checkout.session.completed` | `handleCheckoutCompleted` | Creates or updates subscription record with `active` status; reads `client_reference_id` for user mapping |
| `customer.subscription.updated` | `handleSubscriptionUpdated` | Syncs status, price, period dates, cancel-at-period-end flag |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | Sets status to `canceled` |
| `invoice.paid` | `handleInvoicePaid` | Updates `currentPeriodEnd`, confirms `active` status |
| `invoice.payment_failed` | `handleInvoicePaymentFailed` | Sets status to `past_due` |

All handlers are idempotent. The webhook endpoint always returns HTTP 200 to prevent Stripe retries, even if internal processing fails (errors are logged).

### 5.3 Environment Variables

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Server-side Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification secret |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe Price ID for Pro monthly plan |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Stripe Price ID for Pro yearly plan |

### 5.4 Subscription Database Schema

The `subscriptions` table (`/src/db/schema.ts`) stores:

| Column | Type | Description |
|---|---|---|
| `id` | text (ULID) | Primary key |
| `userId` | text | Foreign key to `users.id` (unique per user) |
| `stripeCustomerId` | text | Stripe Customer ID |
| `stripeSubscriptionId` | text | Stripe Subscription ID (unique) |
| `stripePriceId` | text | Active Stripe Price ID |
| `status` | enum | `active`, `canceled`, `past_due`, `trialing`, `incomplete` |
| `currentPeriodStart` | integer | Period start timestamp (ms) |
| `currentPeriodEnd` | integer | Period end timestamp (ms) |
| `cancelAtPeriodEnd` | integer | 1 if user has scheduled cancellation |
| `createdAt` | integer | Creation timestamp (ms) |
| `updatedAt` | integer | Last update timestamp (ms) |

### 5.5 Customer Portal

The `/api/stripe/portal` endpoint creates a Stripe Billing Portal session, allowing Pro users to:
- View billing history
- Update payment method
- Cancel or resume subscription
- Switch between monthly and yearly plans

### 5.6 Promotion Codes

Stripe Checkout is configured with `allow_promotion_codes: true`, enabling coupon codes for marketing campaigns, influencer partnerships, or seasonal discounts.

---

## 6. Growth Flywheel

The monetization model is designed to create a self-reinforcing growth loop:

```
1. ACQUIRE        User discovers FastLane (SEO, referral, social)
       |
       v
2. ACTIVATE       User registers free -> completes onboarding ->
                   starts first fast within 24h
       |
       v
3. ENGAGE         User builds streak -> daily check-ins ->
                   develops fasting habit over 1-2 weeks
       |
       v
4. MONETIZE       User hits depth limit (7-day history, 4 protocols) ->
                   sees ProGate on advanced features -> upgrades
       |
       v
5. RETAIN         Pro features (trends, heatmap, summaries) deepen
                   engagement -> user sees long-term value
       |
       v
6. REFER          Satisfied user recommends FastLane to friends,
                   shares streak milestones (future social sharing)
       |
       v
       [Back to 1. ACQUIRE]
```

### Key Leverage Points

| Stage | Lever | Mechanism |
|---|---|---|
| Acquire | SEO content | Landing page targets "intermittent fasting app", "fasting timer" |
| Acquire | Social proof | "10,000+ Active Fasters", "4.9-star rating" on hero section |
| Activate | Onboarding | 5-step wizard with personalized protocol recommendation |
| Engage | Streaks | Loss aversion -- users don't want to break their streak |
| Engage | Check-ins | Daily touchpoint creates habit loop |
| Monetize | ProGate | Visible but non-aggressive upgrade triggers at natural touchpoints |
| Monetize | Annual discount | 33% savings incentivizes annual commitment, reduces churn |
| Retain | Analytics | Trend charts and heatmap give users reasons to keep data history |
| Refer | Milestones (future) | Shareable streak achievements, badges |

---

## 7. Revenue Projections Framework

The following framework provides a model for projecting revenue. Actual values should be filled in with real data after launch.

### 7.1 Assumptions Template

| Variable | Estimate | Notes |
|---|---|---|
| Monthly new registrations | ??? | From analytics after launch |
| Onboarding completion rate | 75% | Target from product metrics |
| Day-7 retention | 35% | Target from product metrics |
| Free-to-Pro conversion rate | 5% | Within 30 days of registration |
| Monthly plan share | 60% | vs 40% annual |
| Monthly churn rate | 8% | Pro subscribers who cancel |
| Annual churn rate | 25% | Pro subscribers who don't renew |

### 7.2 Revenue Formula

```
Monthly Recurring Revenue (MRR) =
  (Active Monthly Subscribers x $4.99) +
  (Active Annual Subscribers x $39.99 / 12)

Annual Run Rate (ARR) = MRR x 12

Net New MRR =
  (New Pro conversions x blended ARPU) -
  (Churned subscribers x blended ARPU)
```

### 7.3 Scenario Model

| Scenario | Monthly Signups | Conversion | Monthly Subs | Annual Subs | MRR (Month 12) |
|---|---|---|---|---|---|
| **Conservative** | 500 | 3% | 108 | 72 | ~$780 |
| **Base** | 1,500 | 5% | 540 | 360 | ~$3,890 |
| **Optimistic** | 5,000 | 7% | 2,520 | 1,680 | ~$18,150 |

*Note: These are illustrative projections assuming steady growth and the churn rates above. Replace with actual metrics post-launch.*

### 7.4 Key Levers for Revenue Growth

1. **Increase registration volume** -- SEO, content marketing, paid acquisition, partnerships with wellness influencers.
2. **Improve conversion rate** -- A/B test upgrade page copy, pricing display, and ProGate messaging; offer a 7-day free trial of Pro.
3. **Shift toward annual plans** -- Increase annual discount prominence, offer annual-only features or perks.
4. **Reduce churn** -- In-app re-engagement (streak reminders, weekly emails), win-back campaigns for canceled users.
5. **Expand ARPU** -- Introduce a higher "Coach" tier ($14.99/mo) for wellness professionals who manage multiple clients.

---

## 8. Future Monetization Opportunities

| Opportunity | Description | Estimated Impact |
|---|---|---|
| **Free Trial** | 7-day Pro trial for new users to experience premium features before committing | +20-30% conversion lift |
| **Coach/Team Tier** | Multi-user plan for wellness coaches with client dashboards | New revenue stream, higher ARPU |
| **Lifetime Deal** | One-time payment option ($99-$149) for early adopters | Cash flow boost, community goodwill |
| **Affiliate Program** | Revenue share for wellness bloggers/influencers who drive signups | Scalable acquisition channel |
| **In-App Purchases** | One-time purchases for specific features (e.g., data export, theme packs) | Incremental revenue |
| **API Access** | Developer API for third-party integrations | Enterprise/partner revenue |
