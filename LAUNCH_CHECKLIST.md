# FastLane -- Launch Checklist

**Version:** 1.0
**Last Updated:** 2026-02-25

---

## Pre-Launch

### Environment Variables

- [ ] `NEXTAUTH_SECRET` -- Generate a strong random secret (32+ characters): `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` -- Set to production URL (e.g., `https://fastlane.app`)
- [ ] `NEXT_PUBLIC_APP_URL` -- Set to production URL (used for metadata, OG tags)
- [ ] `STRIPE_SECRET_KEY` -- Stripe **live** secret key (starts with `sk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` -- Stripe live webhook signing secret (starts with `whsec_`)
- [ ] `STRIPE_PRO_MONTHLY_PRICE_ID` -- Stripe live Price ID for Pro monthly ($4.99/mo)
- [ ] `STRIPE_PRO_YEARLY_PRICE_ID` -- Stripe live Price ID for Pro yearly ($39.99/yr)
- [ ] `DATABASE_URL` -- Turso database URL (e.g., `libsql://fastlane-db-<org>.turso.io`)
- [ ] `DATABASE_AUTH_TOKEN` -- Turso auth token for database access
- [ ] OAuth provider credentials (if applicable):
  - [ ] `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
  - [ ] `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`
- [ ] Verify all env vars are set in Vercel project settings (not just `.env.local`)
- [ ] Confirm no env vars contain test/sandbox values

### Stripe Setup

- [ ] Create live Stripe products and prices:
  - [ ] Product: "FastLane Pro"
  - [ ] Price: $4.99/month (recurring, monthly)
  - [ ] Price: $39.99/year (recurring, yearly)
- [ ] Configure Stripe webhook endpoint:
  - [ ] URL: `https://fastlane.app/api/stripe/webhook`
  - [ ] Events to listen for:
    - `checkout.session.completed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.paid`
    - `invoice.payment_failed`
- [ ] Enable Stripe Customer Portal:
  - [ ] Allow customers to cancel subscriptions
  - [ ] Allow customers to switch plans (monthly <-> yearly)
  - [ ] Allow customers to update payment method
- [ ] Test the full checkout flow in Stripe test mode with test card `4242 4242 4242 4242`
- [ ] Verify webhook delivery in Stripe dashboard (test mode)
- [ ] Enable promotion codes in Stripe if running launch promotions
- [ ] Set up Stripe tax settings if required for your jurisdiction

### Database

- [ ] Create production Turso database
- [ ] Run database migrations: `pnpm db:migrate` (against production database URL)
- [ ] Verify all tables exist: `users`, `accounts`, `sessions`, `verificationTokens`, `userProfiles`, `fastingSessions`, `dailyCheckins`, `subscriptions`, `analyticsEvents`
- [ ] Confirm migration files are committed: `/src/db/migrations/`
- [ ] Set up database backup schedule (Turso provides point-in-time recovery)
- [ ] Test database connectivity from Vercel deployment

### Domain and SSL

- [ ] Purchase and configure domain (e.g., `fastlane.app`)
- [ ] Add domain to Vercel project settings
- [ ] Configure DNS records (Vercel will provide A/CNAME records)
- [ ] Verify SSL certificate is auto-provisioned by Vercel
- [ ] Set up `www` redirect to apex domain (or vice versa)
- [ ] Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to match the final domain

### SEO and Social

- [ ] Verify `metadata` in `/src/app/layout.tsx` has correct production values:
  - [ ] Title: "FastLane - Intermittent Fasting Made Simple"
  - [ ] Description is compelling and under 160 characters
  - [ ] Keywords include target search terms
  - [ ] `metadataBase` points to production URL
- [ ] Verify Open Graph tags render correctly (use [opengraph.xyz](https://www.opengraph.xyz/))
- [ ] Verify Twitter Card tags render correctly (use [Twitter Card Validator](https://cards-dev.twitter.com/validator))
- [ ] Create and upload OG image (1200x630px) for social sharing
- [ ] Add `robots.txt` allowing all crawlers
- [ ] Generate and submit `sitemap.xml` to Google Search Console
- [ ] Set up Google Search Console and verify domain ownership

### PWA

- [ ] Verify `/public/manifest.json` has correct `name`, `short_name`, `start_url`, `theme_color`
- [ ] Verify app icons exist at required sizes: 192x192, 512x512
- [ ] Verify Apple Touch Icon exists at `/public/apple-touch-icon.png`
- [ ] Test PWA install prompt on Android Chrome and iOS Safari
- [ ] Verify offline page (`/offline`) renders correctly when disconnected
- [ ] Test "Add to Home Screen" on a physical mobile device

### Code Quality

- [ ] All unit tests passing: `pnpm test`
- [ ] All E2E tests passing: `pnpm test:e2e`
- [ ] TypeScript compiles without errors: `pnpm typecheck`
- [ ] ESLint passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] No console errors or warnings on key pages (landing, dashboard, auth)
- [ ] Review all `TODO` and `FIXME` comments in codebase

### Security

- [ ] Auth.js secret is unique and not reused from development
- [ ] Stripe webhook signature verification is active (not bypassed)
- [ ] API routes check authentication where required (all `/api/fasting/*`, `/api/stripe/checkout`, `/api/stripe/portal`, `/api/checkin`, `/api/analytics`)
- [ ] Stripe webhook route (`/api/stripe/webhook`) does NOT require auth (verified by signature instead)
- [ ] Password hashing uses bcrypt with sufficient rounds
- [ ] No secrets in client-side code (check `NEXT_PUBLIC_` prefix usage)
- [ ] `Content-Security-Policy` headers configured if applicable
- [ ] Rate limiting on auth endpoints (consider middleware or Vercel Edge Config)

### Performance

- [ ] Lighthouse score > 90 on landing page (Performance, Accessibility, Best Practices, SEO)
- [ ] First Contentful Paint < 1.5s on landing page
- [ ] No layout shift on timer page (tabular-nums for digits)
- [ ] Images optimized (use `next/image` or pre-optimized assets)
- [ ] Fonts loaded via `next/font` (already configured for Geist)

---

## Launch Day

### Deployment

- [ ] Merge final changes to `main` branch
- [ ] Verify Vercel deployment triggers automatically
- [ ] Confirm deployment completes without build errors
- [ ] Verify production URL resolves and loads correctly
- [ ] Check that environment variables are active in production (Vercel dashboard)

### Smoke Test -- Critical Flows

- [ ] **Landing Page:** Loads with hero, features, testimonials, pricing, CTA, footer
- [ ] **Registration:** Create a new account with email/password
- [ ] **Login:** Log in with the newly created account
- [ ] **Onboarding:** Complete all 5 onboarding steps -> redirect to dashboard
- [ ] **Start a Fast:** Select 16:8 protocol -> tap Start -> timer begins counting
- [ ] **Timer Persistence:** Refresh the page -> timer continues from where it left off
- [ ] **Complete a Fast:** Tap Complete -> check-in dialog appears -> submit check-in
- [ ] **History:** Navigate to History -> verify the completed fast appears
- [ ] **Stats:** Navigate to Stats -> verify streak count updated
- [ ] **ProGate:** Navigate to Stats -> verify Pro features show blurred overlay for free user
- [ ] **Upgrade Page:** Navigate to Upgrade -> verify plan comparison renders with correct prices
- [ ] **Stripe Checkout:** Click Upgrade -> redirected to Stripe Checkout -> complete with test card (if in test mode) or verify redirect (if live)
- [ ] **Stripe Portal:** Access billing portal from Settings -> verify it loads
- [ ] **Logout:** Log out -> redirected to login page
- [ ] **Protected Routes:** Access `/dashboard` while logged out -> redirect to `/login`
- [ ] **Offline Page:** Disconnect network -> navigate -> offline page renders
- [ ] **Mobile Responsive:** Repeat key flows on a mobile device or emulator

### Stripe Verification (Live Mode)

- [ ] Complete a real purchase using a real payment method
- [ ] Verify webhook events are received in Stripe dashboard (live mode)
- [ ] Verify subscription record is created in production database
- [ ] Verify Pro features unlock immediately after purchase
- [ ] Verify Stripe Customer Portal is accessible and functional
- [ ] Verify cancellation flow works (cancel -> status updates to canceled)

### Monitoring Setup

- [ ] Enable Vercel Analytics (Web Vitals, traffic)
- [ ] Enable Vercel Error Tracking or connect Sentry
- [ ] Set up Stripe webhook failure alerts (Stripe Dashboard > Webhooks > Alert preferences)
- [ ] Configure uptime monitoring (e.g., Better Uptime, Vercel Cron, or Checkly)
- [ ] Verify analytics events are being recorded (`/api/analytics` endpoint receiving data)

---

## Post-Launch

### First 24 Hours

- [ ] Monitor Vercel deployment logs for errors
- [ ] Monitor Stripe webhook delivery success rate (target: 100%)
- [ ] Check database for any anomalies (duplicate records, failed migrations)
- [ ] Review any user-reported issues
- [ ] Verify Google Search Console is indexing the site

### First Week

- [ ] **Analytics Review:**
  - [ ] Track registration count and registration rate
  - [ ] Track onboarding completion rate (target: > 75%)
  - [ ] Track first-fast-started rate (target: > 60%)
  - [ ] Track Day-1 retention
  - [ ] Track upgrade page visit rate
- [ ] **Performance Monitoring:**
  - [ ] Review Vercel Web Vitals (LCP, FID, CLS)
  - [ ] Check for any slow API routes (> 500ms response time)
  - [ ] Monitor database query performance
- [ ] **User Feedback:**
  - [ ] Set up a feedback channel (email, in-app form, or support widget)
  - [ ] Review and triage any bug reports
  - [ ] Identify top user requests for prioritization
- [ ] **Error Tracking:**
  - [ ] Review error logs for recurring issues
  - [ ] Fix any critical bugs with hotfix deployments
  - [ ] Ensure no unhandled exceptions in production

### First Month

- [ ] **Retention Analysis:**
  - [ ] Calculate D7 retention (target: > 35%)
  - [ ] Calculate D30 retention (target: > 20%)
  - [ ] Identify drop-off points in the user journey
- [ ] **Conversion Analysis:**
  - [ ] Calculate free-to-Pro conversion rate (target: > 5%)
  - [ ] Analyze upgrade page funnel (visit -> checkout -> complete)
  - [ ] Review which ProGate touchpoints drive the most upgrades
- [ ] **Engagement Metrics:**
  - [ ] Average fasts per user per week (target: > 4)
  - [ ] Check-in completion rate (target: > 50%)
  - [ ] Average streak length (target: > 5 days)
- [ ] **Infrastructure:**
  - [ ] Review database size and query performance
  - [ ] Evaluate need for database scaling (Turso plan upgrade)
  - [ ] Review Vercel usage and billing

---

## Infrastructure Reference

### Production Stack

| Component | Service | Plan | Notes |
|---|---|---|---|
| **Hosting** | Vercel | Pro | Serverless functions, Edge middleware, auto-scaling |
| **Database** | Turso (libSQL) | Starter or Scaler | SQLite-compatible, edge-replicated, built-in backups |
| **Auth** | Auth.js v5 | Self-hosted | Runs within Next.js; JWT sessions via middleware |
| **Payments** | Stripe | Standard | Checkout, Webhooks, Customer Portal, Billing |
| **DNS** | Vercel or Cloudflare | Free | HTTPS auto-provisioned |
| **Monitoring** | Vercel Analytics + Sentry | Free / Team | Web Vitals, error tracking |
| **Email (future)** | Resend or Postmark | Free tier | Transactional emails (welcome, streak milestones, receipts) |

### Database Migration Workflow

```bash
# 1. Make schema changes in /src/db/schema.ts

# 2. Generate migration files
pnpm db:generate

# 3. Review generated SQL in /src/db/migrations/

# 4. Run migrations against production
DATABASE_URL=<turso-url> DATABASE_AUTH_TOKEN=<token> pnpm db:migrate
```

### Vercel Deployment Configuration

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Build Command | `pnpm build` |
| Output Directory | `.next` |
| Install Command | `pnpm install --frozen-lockfile` |
| Node.js Version | 20.x |
| Root Directory | `/` |

### Stripe Configuration Summary

| Item | Development | Production |
|---|---|---|
| API Keys | `sk_test_...` | `sk_live_...` |
| Webhook Endpoint | `stripe listen --forward-to localhost:3000/api/stripe/webhook` | `https://fastlane.app/api/stripe/webhook` |
| Webhook Secret | `whsec_...` (CLI-provided) | `whsec_...` (Dashboard-provided) |
| Price IDs | `price_test_...` | `price_live_...` |
| Customer Portal | Enabled in test mode | Enabled in live mode |

---

## Emergency Procedures

### Rollback

```bash
# Vercel instant rollback to previous deployment
vercel rollback --project fastlane-app

# Or from Vercel Dashboard: Deployments -> select previous -> Promote to Production
```

### Database Recovery

```bash
# Turso point-in-time recovery (contact Turso support or use dashboard)
# For immediate rollback, restore from the latest Turso snapshot
```

### Stripe Issues

- **Webhook failures:** Check Stripe Dashboard > Webhooks > Events. Failed events can be manually retried.
- **Payment issues:** Use Stripe Dashboard > Payments to review and refund if necessary.
- **Subscription sync issues:** Manually update the `subscriptions` table to match Stripe state, or trigger a re-sync by retrying the relevant webhook event.
