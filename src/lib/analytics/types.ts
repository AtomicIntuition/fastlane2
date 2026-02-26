export interface AnalyticsEvent {
  event: string
  properties?: Record<string, unknown>
  userId?: string
  sessionId?: string
  timestamp: number
}

export interface AnalyticsProvider {
  name: string
  track(event: AnalyticsEvent): void
  identify?(userId: string, traits?: Record<string, unknown>): void
  page?(name: string, properties?: Record<string, unknown>): void
}

// Event name constants
export const EVENTS = {
  // Landing
  LANDING_VIEW: 'landing.view',
  LANDING_CTA_CLICK: 'landing.cta_click',
  PRICING_VIEW: 'pricing.view',
  PRICING_PLAN_SELECT: 'pricing.plan_select',

  // Auth
  AUTH_REGISTER: 'auth.register',
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_OAUTH_START: 'auth.oauth_start',

  // Onboarding
  ONBOARDING_START: 'onboarding.start',
  ONBOARDING_STEP: 'onboarding.step',
  ONBOARDING_COMPLETE: 'onboarding.complete',
  ONBOARDING_SKIP: 'onboarding.skip',

  // Fasting
  FAST_START: 'fast.start',
  FAST_COMPLETE: 'fast.complete',
  FAST_CANCEL: 'fast.cancel',
  FAST_EXTEND: 'fast.extend',

  // Check-in
  CHECKIN_SUBMIT: 'checkin.submit',

  // Subscription
  SUBSCRIPTION_START: 'subscription.start',
  SUBSCRIPTION_COMPLETE: 'subscription.complete',
  SUBSCRIPTION_CANCEL: 'subscription.cancel',

  // PWA
  PWA_INSTALL_PROMPT: 'pwa.install_prompt',
  PWA_INSTALL_ACCEPT: 'pwa.install_accept',
  PWA_INSTALL_DISMISS: 'pwa.install_dismiss',
} as const
