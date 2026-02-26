import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance — sample 10% of transactions
  tracesSampleRate: 0.1,

  // Session replay — capture 100% of error sessions, 0% otherwise
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,
})
