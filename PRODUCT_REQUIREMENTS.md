# FastLane -- Product Requirements Document

**Version:** 1.0
**Last Updated:** 2026-02-25
**Status:** Active

---

## 1. Product Vision

FastLane is a progressive web application that makes intermittent fasting accessible, trackable, and motivating for everyone -- from curious beginners to committed biohackers. The app combines a beautiful real-time fasting timer with smart protocol recommendations, streak tracking, mood/energy check-ins, and data-driven insights, all wrapped in a mobile-first PWA that feels native on any device.

**Mission:** Remove friction from intermittent fasting so users can focus on their health goals, not on logistics.

**Core Value Proposition:** Start a fast in two taps, watch your progress live, and build lasting habits through streaks and insights -- free forever for the basics, with a Pro tier for power users.

---

## 2. Target Audience

- **Primary:** Health-conscious adults (25-45) who practice or want to start intermittent fasting.
- **Secondary:** Fitness enthusiasts and biohackers who use fasting as part of a broader health protocol.
- **Tertiary:** Wellness coaches who recommend fasting tools to clients.

---

## 3. User Personas

### Persona 1: Sarah -- The Curious Beginner

| Attribute | Detail |
|---|---|
| **Age** | 29 |
| **Occupation** | Marketing manager |
| **Tech Comfort** | High -- uses apps for fitness, food tracking, and meditation |
| **Fasting Experience** | Has heard of 16:8 but never tried a structured fast |
| **Goals** | Lose 10 lbs, improve energy, build a consistent routine |
| **Pain Points** | Overwhelmed by information, unsure which protocol to choose, forgets when her eating window starts/ends |
| **What She Needs** | Guided onboarding, a clear protocol recommendation, simple timer with notifications, encouragement through streaks |

### Persona 2: Marcus -- The Committed Practitioner

| Attribute | Detail |
|---|---|
| **Age** | 37 |
| **Occupation** | Software engineer |
| **Tech Comfort** | Very high -- wants data, charts, and export capabilities |
| **Fasting Experience** | Has done 16:8 for two years, experiments with OMAD and 36-hour fasts |
| **Goals** | Optimize for autophagy and longevity, track trends over months |
| **Pain Points** | Current app only supports basic protocols, no advanced analytics, history limited to 7 days |
| **What He Needs** | All 8 protocols including OMAD and 36h, unlimited history, trend charts, calendar heatmap, weekly summary reports |

### Persona 3: Aisha -- The Wellness Coach

| Attribute | Detail |
|---|---|
| **Age** | 42 |
| **Occupation** | Certified nutritionist and wellness coach |
| **Tech Comfort** | Moderate -- uses apps professionally but values simplicity |
| **Fasting Experience** | Expert-level knowledge; recommends fasting to clients |
| **Goals** | Find a reliable, well-designed tool she can recommend to clients of all levels |
| **Pain Points** | Most fasting apps are cluttered, hard to explain to beginners, or lack a free tier |
| **What She Needs** | Clean UX that beginners can navigate, a generous free plan, credible brand, progressive disclosure of advanced features |

---

## 4. Feature Requirements

### 4.1 Must-Have (P0) -- MVP

| ID | Feature | Description |
|---|---|---|
| P0-01 | **Landing Page** | Marketing page with hero, features, testimonials, pricing comparison, and CTA sections |
| P0-02 | **User Registration** | Email/password signup with name, email, and password validation (Zod) |
| P0-03 | **User Login** | Email/password and OAuth (Google/GitHub) login via Auth.js v5 |
| P0-04 | **Onboarding Wizard** | 5-step wizard: fasting goal, experience level, protocol recommendation, preferences (timezone, notifications), and summary |
| P0-05 | **Live Fasting Timer** | Real-time countdown ring with hours/minutes/seconds, progress percentage, overtime tracking, and persist-across-refresh via Zustand + localStorage |
| P0-06 | **Protocol Selection** | 4 free protocols (12:12, 14:10, 16:8, 18:6) with difficulty badges and benefit tags |
| P0-07 | **Start / Complete / Cancel Fast** | API-backed mutations for starting, completing, and cancelling fasting sessions |
| P0-08 | **Fasting History** | Paginated history of past fasts with protocol, duration, and completion status |
| P0-09 | **Streak Tracking** | Current streak, longest streak, total completed fasts, and 30-day completion rate |
| P0-10 | **Daily Check-in** | Post-fast mood (5 levels), hunger level (1-10 slider), energy level (1-10 slider), optional notes |
| P0-11 | **Responsive Layout** | Mobile-first with bottom navigation, desktop sidebar, and shared app shell |
| P0-12 | **PWA Support** | Web app manifest, offline page, installable on mobile and desktop |

### 4.2 Should-Have (P1) -- Pro Tier & Growth

| ID | Feature | Description |
|---|---|---|
| P1-01 | **Pro Subscription (Stripe)** | Monthly ($4.99) and yearly ($39.99) plans via Stripe Checkout with webhook-driven lifecycle management |
| P1-02 | **Extended Protocols** | 4 additional protocols for Pro: 20:4 Warrior, OMAD (23:1), 36-Hour Fast, and Custom |
| P1-03 | **Custom Protocols** | Pro users can define arbitrary fasting/eating hour combinations |
| P1-04 | **Unlimited History** | Pro users see full history; free users limited to 7 days |
| P1-05 | **Calendar Heatmap** | Visual calendar showing fasting activity density (Pro) |
| P1-06 | **Trend Charts** | Line/bar charts showing fasting hours, streaks, and check-in trends over time (Pro) |
| P1-07 | **Weekly Summary** | Automated weekly report with key metrics (Pro) |
| P1-08 | **Extend Fast** | Add 1 hour to an active session with a single tap |
| P1-09 | **Stripe Customer Portal** | Self-service billing management at `/api/stripe/portal` |
| P1-10 | **Feature Gating (ProGate)** | Blurred overlay with upgrade CTA on locked features |
| P1-11 | **Upgrade Page** | In-app upgrade flow at `/upgrade` with plan comparison and Stripe checkout redirect |

### 4.3 Nice-to-Have (P2) -- Future Iterations

| ID | Feature | Description |
|---|---|---|
| P2-01 | **Push Notifications** | Browser/native push for fast start, mid-fast encouragement, and fast completion |
| P2-02 | **Social Sharing** | Share streak milestones and completed fasts to social media |
| P2-03 | **Dark Mode Toggle** | Manual theme switcher (currently system-preference only) |
| P2-04 | **Export Data** | CSV/JSON export of fasting history and check-in data |
| P2-05 | **Apple Health / Google Fit** | Sync fasting data to native health platforms |
| P2-06 | **Guided Fasting Programs** | Multi-day/multi-week structured fasting programs with daily guidance |
| P2-07 | **Community / Leaderboards** | Anonymized leaderboards and community streak challenges |
| P2-08 | **Multi-language Support** | i18n for top 5 languages |
| P2-09 | **Coach Dashboard** | Separate view for wellness coaches to monitor client progress |

---

## 5. User Stories -- Core Flows

### 5.1 Registration and Onboarding

```
As a new user,
I want to create an account and be guided through personalized setup,
so that I start fasting with the right protocol for my goals and experience.
```

**Acceptance Criteria:**
- User can register with name, email, and password (validated by Zod schema)
- User can alternatively register via Google or GitHub OAuth
- After registration, user is routed to a 5-step onboarding wizard
- Wizard recommends a protocol based on selected goal and experience level
- Timezone is auto-detected; notifications toggle is available
- Step 5 shows a summary before final submission
- On completion, user is redirected to `/dashboard`

### 5.2 Starting a Fasting Session

```
As an authenticated user,
I want to choose a fasting protocol and start a live timer,
so that I can track my fasting progress in real time.
```

**Acceptance Criteria:**
- Dashboard shows a protocol picker when no fast is active
- Free users see 4 protocols; Pro users see all 8 including Custom
- Tapping "Start Fast" calls `POST /api/fasting/start` and begins the timer
- Timer state persists in Zustand store (localStorage-backed) so it survives page refreshes
- Timer ring shows elapsed time, remaining time, progress percentage, and protocol name
- When the timer reaches 100%, it enters "overtime" mode with a distinct visual

### 5.3 Completing a Fast

```
As a user with an active fasting session,
I want to end my fast and log how I feel,
so that I build a record of my fasting experience.
```

**Acceptance Criteria:**
- "Complete" button calls `POST /api/fasting/complete`
- A check-in dialog appears asking for mood, hunger level, energy level, and optional notes
- The check-in is saved via `POST /api/checkin`
- Dashboard updates streaks immediately after completion
- Completed session appears in history

### 5.4 Viewing History and Streaks

```
As a returning user,
I want to see my past fasts and current streak,
so that I stay motivated and track my consistency.
```

**Acceptance Criteria:**
- History page shows a paginated list of past sessions with protocol, duration, status, and date
- Free users see the last 7 days; Pro users see unlimited history
- Stats page shows current streak, longest streak, total fasts, and 30-day completion rate
- Pro users see calendar heatmap, trend charts, and weekly summary

### 5.5 Upgrading to Pro

```
As a free user who has hit a feature limit,
I want to upgrade to the Pro plan,
so that I can access advanced protocols, unlimited history, and analytics.
```

**Acceptance Criteria:**
- Locked features show a blurred overlay with "Upgrade to Pro" CTA (ProGate component)
- Upgrade page compares Free vs Pro with monthly/yearly toggle
- Clicking "Upgrade" creates a Stripe Checkout session and redirects to Stripe
- After payment, Stripe webhook updates subscription status to `active`
- User is redirected to `/dashboard?upgraded=true`
- Pro features unlock immediately without requiring re-login

---

## 6. Success Metrics

### 6.1 Activation

| Metric | Definition | Target |
|---|---|---|
| Registration rate | Visitors who complete registration / total landing page visitors | > 8% |
| Onboarding completion | Users who complete all 5 onboarding steps / total registrations | > 75% |
| First fast started | Users who start a fast within 24h of registration | > 60% |
| First fast completed | Users who complete their first fast / users who started one | > 70% |

### 6.2 Retention

| Metric | Definition | Target |
|---|---|---|
| D1 retention | Users who return within 24h of first session | > 50% |
| D7 retention | Users active on day 7 after registration | > 35% |
| D30 retention | Users active on day 30 after registration | > 20% |
| Weekly active users (WAU) | Unique users who complete at least 1 fast per week | Growing MoM |
| Average streak length | Mean current streak across all active users | > 5 days |

### 6.3 Conversion

| Metric | Definition | Target |
|---|---|---|
| Free-to-Pro conversion | Free users who upgrade to Pro within 30 days | > 5% |
| Upgrade page visit rate | Users who view the upgrade page / total active users | > 15% |
| Checkout completion | Users who complete Stripe checkout / users who initiated it | > 60% |
| Annual plan share | Pro subscribers on yearly vs monthly | > 40% yearly |
| Churn rate (monthly) | Pro subscribers who cancel within a billing period | < 8% |

### 6.4 Engagement

| Metric | Definition | Target |
|---|---|---|
| Fasts per user per week | Average number of completed fasts per active user per week | > 4 |
| Check-in rate | Percentage of completed fasts that include a check-in | > 50% |
| Session duration vs target | Average actual fast duration / target duration | > 90% |
| Feature adoption (Pro) | Pro users using calendar heatmap, trend charts, or weekly summary | > 60% |

---

## 7. Technical Constraints

- **Framework:** Next.js 15 with App Router (React 19, Turbopack dev)
- **Database:** SQLite via better-sqlite3 locally; Turso (libSQL) for production
- **ORM:** Drizzle ORM with migration support
- **Auth:** Auth.js v5 (NextAuth beta) with credentials + OAuth providers
- **Payments:** Stripe Checkout + Webhooks (subscription lifecycle)
- **State Management:** Zustand (timer), TanStack Query (server state)
- **Styling:** Tailwind CSS v4 with custom design tokens (`tokens.css`)
- **Testing:** Vitest + React Testing Library (unit), Playwright (E2E)
- **Deployment:** Vercel (serverless, edge middleware)
- **PWA:** Web manifest, offline fallback page, service worker (via next-pwa or custom)

---

## 8. Out of Scope (v1)

- Native iOS/Android apps (PWA serves mobile users)
- Real-time multiplayer or social features
- AI-powered fasting recommendations
- Integration with wearables (Apple Watch, Fitbit)
- Admin dashboard for internal operations
- Multi-tenant or team plans
