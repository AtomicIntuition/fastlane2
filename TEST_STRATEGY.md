# FastLane -- Test Strategy

**Version:** 1.0
**Last Updated:** 2026-02-25

---

## 1. Testing Philosophy

FastLane follows a practical testing pyramid with heavy investment in unit tests for business logic, targeted component tests for interactive UI, and end-to-end tests for critical user flows. The goal is fast feedback in development (sub-second unit tests) with high-confidence checks before deployment (E2E).

**Guiding Principles:**

1. Test behavior, not implementation -- assert what the user sees or what the system produces.
2. Business logic gets the most coverage -- fasting protocols, streak calculations, entitlements, date utilities, and validation are pure functions that are easy and fast to test.
3. Component tests cover interaction patterns -- timer ring rendering, button clicks, protocol selection.
4. E2E tests protect critical paths -- landing page rendering, auth flows, redirect behavior.
5. Tests are colocated with source code -- test files live in `__tests__/` directories next to the code they test.

---

## 2. Testing Pyramid

```
                    /\
                   /  \
                  / E2E \          ~12 tests
                 / (Playwright) \
                /________________\
               /                  \
              /    Component       \    ~20 tests
             /  (Vitest + RTL)      \
            /________________________\
           /                          \
          /         Unit               \   ~85 tests
         /     (Vitest, pure fn)        \
        /________________________________\
```

| Layer | Tool | Count | Speed | Confidence | What It Tests |
|---|---|---|---|---|---|
| **Unit** | Vitest | ~85 tests | < 5 sec total | Function-level correctness | Pure business logic: protocols, streaks, dates, validation, entitlements |
| **Component** | Vitest + React Testing Library | ~20 tests | < 10 sec total | Render + interaction correctness | TimerRing, ProtocolPicker, Button -- render states, click handlers, a11y |
| **E2E** | Playwright | ~12 tests | < 60 sec total | Full-stack user flow correctness | Landing page, auth pages, redirects, form validation |

---

## 3. Current Test Coverage

### 3.1 Summary

- **Total test files:** 8 (unit) + 2 (E2E) = 10
- **Total test cases:** 105 (unit + component) + 12 (E2E) = ~117
- **All tests passing:** Yes

### 3.2 Test File Inventory

#### Unit & Component Tests (Vitest)

| # | File | Type | Tests | What It Covers |
|---|---|---|---|---|
| 1 | `src/lib/fasting/__tests__/protocols.test.ts` | Unit | ~15 | Protocol lookup, filtering by difficulty, free protocol filtering, recommendation engine |
| 2 | `src/lib/fasting/__tests__/streaks.test.ts` | Unit | ~18 | Streak calculation: empty data, single day, consecutive days, gaps, longest vs current, 30-day completion rate |
| 3 | `src/lib/utils/__tests__/dates.test.ts` | Unit | ~14 | `toDateString`, `formatDuration`, `nowUtc`, edge cases around midnight, timezone handling |
| 4 | `src/lib/utils/__tests__/validation.test.ts` | Unit | ~20 | Zod schemas: registration input, login input, onboarding input, check-in input; valid/invalid payloads, edge cases |
| 5 | `src/lib/stripe/__tests__/entitlements.test.ts` | Unit | ~12 | `getEntitlements` for free/pro, `hasEntitlement` for every feature flag, unknown plan fallback |
| 6 | `src/components/ui/__tests__/Button.test.tsx` | Component | ~10 | Button rendering (all variants, sizes), click handling, disabled state, loading state, icon placement |
| 7 | `src/components/fasting/__tests__/TimerRing.test.tsx` | Component | ~8 | Timer ring rendering at 0%, 50%, 100%, overtime mode, protocol label, accessibility attributes |
| 8 | `src/components/fasting/__tests__/ProtocolPicker.test.tsx` | Component | ~8 | Protocol list rendering, selection callback, Pro lock indicators, recommended badge |

#### End-to-End Tests (Playwright)

| # | File | Tests | What It Covers |
|---|---|---|---|
| 1 | `e2e/landing.spec.ts` | 6 | Hero section loads, features visible, pricing section renders, nav links present, CTA links to /register, footer visible |
| 2 | `e2e/auth.spec.ts` | 6 | Login page loads, register page loads, login validation errors, register validation errors, unauthenticated redirect to login, cross-page links |

---

## 4. Test File Locations and Conventions

### 4.1 Directory Structure

```
src/
  lib/
    fasting/
      __tests__/
        protocols.test.ts     # Tests for protocols.ts
        streaks.test.ts       # Tests for streaks.ts
    utils/
      __tests__/
        dates.test.ts         # Tests for dates.ts
        validation.test.ts    # Tests for validation.ts
    stripe/
      __tests__/
        entitlements.test.ts  # Tests for entitlements.ts
  components/
    ui/
      __tests__/
        Button.test.tsx       # Tests for Button.tsx
    fasting/
      __tests__/
        TimerRing.test.tsx    # Tests for TimerRing.tsx
        ProtocolPicker.test.tsx  # Tests for ProtocolPicker.tsx
e2e/
  landing.spec.ts             # Landing page E2E tests
  auth.spec.ts                # Authentication E2E tests
```

### 4.2 Naming Conventions

| Convention | Rule | Example |
|---|---|---|
| Unit test files | `{module}.test.ts` | `protocols.test.ts` |
| Component test files | `{Component}.test.tsx` | `Button.test.tsx` |
| E2E test files | `{feature}.spec.ts` | `landing.spec.ts` |
| Test directory | `__tests__/` adjacent to source | `src/lib/fasting/__tests__/` |
| Test descriptions | `describe('ModuleName', ...)` with nested `it('should ...')` or `test('...')` | `describe('calculateStreaks', () => { test('returns zero for empty sessions', ...) })` |

### 4.3 Import Aliases

Tests use the same `@/` path alias as production code, configured in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

---

## 5. Tools and Configuration

### 5.1 Vitest (Unit + Component)

**Config file:** `/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Key details:**
- **Environment:** jsdom (browser simulation for React component tests)
- **Globals:** `true` -- `describe`, `it`, `expect`, `vi` are available globally without imports
- **Setup file:** `/src/test/setup.ts` -- imports `@testing-library/jest-dom/vitest` for DOM matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.)
- **Coverage:** Reports in text, JSON, and HTML formats
- **React plugin:** `@vitejs/plugin-react` for JSX transform

### 5.2 React Testing Library

**Package:** `@testing-library/react` v16.3.2

Used for component tests. Provides `render`, `screen`, `fireEvent`, `waitFor`, and other utilities that encourage testing from the user's perspective (finding elements by role, label, text).

### 5.3 Playwright (E2E)

**Config file:** `/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Key details:**
- **Test directory:** `/e2e/`
- **Browser:** Chromium only (Desktop Chrome device profile)
- **Web server:** Auto-builds and starts the Next.js app before running tests
- **Retries:** 2 retries on CI, 0 locally
- **Tracing:** Captures a trace on first retry for debugging failures
- **Parallelism:** Full parallel locally, single worker on CI for stability
- **`forbidOnly`:** Fails if `.only` is left in tests on CI

---

## 6. How to Run Tests

### 6.1 Unit and Component Tests

```bash
# Run all unit + component tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with coverage report
pnpm test -- --coverage

# Run a specific test file
pnpm test src/lib/fasting/__tests__/protocols.test.ts

# Run tests matching a pattern
pnpm test -- -t "calculateStreaks"
```

### 6.2 End-to-End Tests

```bash
# Run all E2E tests (builds and starts the app automatically)
pnpm test:e2e

# Run E2E tests in headed mode (visible browser)
pnpm test:e2e -- --headed

# Run a specific E2E test file
pnpm test:e2e e2e/landing.spec.ts

# Run E2E tests with Playwright UI mode
pnpm test:e2e -- --ui

# View the HTML report from the last run
npx playwright show-report
```

### 6.3 Related Quality Commands

```bash
# TypeScript type checking (no emit)
pnpm typecheck

# ESLint
pnpm lint
```

---

## 7. CI Pipeline Overview

### 7.1 Recommended Pipeline Stages

The following stages should run on every pull request and merge to main:

```
1. Install Dependencies
   pnpm install --frozen-lockfile

2. Type Check
   pnpm typecheck

3. Lint
   pnpm lint

4. Unit + Component Tests
   pnpm test

5. Build
   pnpm build

6. E2E Tests
   pnpm test:e2e

7. Deploy (main branch only)
   Vercel auto-deployment via Git integration
```

### 7.2 Stage Dependencies

```
[Install] --> [Type Check] --\
                              +--> [Build] --> [E2E Tests] --> [Deploy]
[Install] --> [Lint] --------/
[Install] --> [Unit Tests] --/
```

Type check, lint, and unit tests can run in parallel. Build depends on all three passing. E2E tests require a successful build.

### 7.3 Environment Configuration for CI

| Variable | CI Value | Notes |
|---|---|---|
| `CI` | `true` | Enables CI-specific behavior (Playwright retries, single worker, forbidOnly) |
| `DATABASE_URL` | SQLite in-memory or file | E2E tests need a database |
| `NEXTAUTH_SECRET` | Test secret | Required for Auth.js |
| `NEXTAUTH_URL` | `http://localhost:3000` | Required for Auth.js |

Stripe-related env vars can use test mode keys for E2E tests that exercise the upgrade flow.

### 7.4 Caching Strategy

| Artifact | Cache Key | Benefit |
|---|---|---|
| `node_modules` | `pnpm-lock.yaml` hash | Skip install if lockfile unchanged |
| `.next/cache` | Build cache hash | Faster incremental builds |
| Playwright browsers | Playwright version | Skip browser download |

---

## 8. Testing Gaps and Roadmap

### 8.1 Current Gaps

| Area | Gap | Priority |
|---|---|---|
| **API Routes** | No tests for the 13 API route handlers (fasting CRUD, auth, Stripe, analytics) | High |
| **Webhook Handlers** | `webhook-handlers.ts` has complex branching logic but no dedicated tests | High |
| **Session Manager** | `session-manager.ts` orchestrates fasting lifecycle but is untested | Medium |
| **Hooks** | `use-timer`, `use-fasting-session`, `use-auth`, `use-analytics` have no tests | Medium |
| **Store** | `timer-store` persistence and hydration logic is untested | Medium |
| **E2E: Fasting Flow** | No E2E test for starting, timing, and completing a fast | Medium |
| **E2E: Upgrade Flow** | No E2E test for Stripe checkout (requires Stripe test fixtures) | Low |
| **Visual Regression** | No screenshot comparison tests for UI consistency | Low |
| **Accessibility** | No automated a11y audit (e.g., axe-playwright) | Medium |

### 8.2 Recommended Next Steps

1. **Add API route tests** using Vitest with mocked database and auth session. Test each route for: valid input, invalid input, unauthorized access, and error handling.
2. **Add webhook handler tests** with mocked Stripe event objects and database assertions.
3. **Add `axe-playwright`** accessibility checks to E2E tests for automated WCAG compliance.
4. **Add E2E fasting flow test** that registers a user, completes onboarding, starts a fast, and verifies the timer is running.
5. **Set up coverage thresholds** in CI to prevent coverage regression (target: 70% line coverage for `src/lib/`).
