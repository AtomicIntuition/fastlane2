'use client'

import { useState } from 'react'
import {
  Crown,
  Check,
  Shield,
  Zap,
  BarChart3,
  Calendar,
  TrendingUp,
  FileText,
  Headphones,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import { PRO_PLAN } from '@/lib/stripe/plans'
import { formatDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UpgradeContentProps {
  isProActive: boolean
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: number | null
}

/* ------------------------------------------------------------------ */
/*  Comparison features data                                           */
/* ------------------------------------------------------------------ */

interface ComparisonFeature {
  label: string
  free: boolean | string
  pro: boolean | string
  icon: React.ReactNode
}

const comparisonFeatures: ComparisonFeature[] = [
  {
    label: 'Fasting protocols',
    free: '4 basic',
    pro: 'All 8 + custom',
    icon: <Zap size={16} />,
  },
  {
    label: 'Fasting history',
    free: '7 days',
    pro: 'Unlimited',
    icon: <Calendar size={16} />,
  },
  {
    label: 'Advanced streak statistics',
    free: false,
    pro: true,
    icon: <BarChart3 size={16} />,
  },
  {
    label: 'Calendar heatmap view',
    free: false,
    pro: true,
    icon: <Calendar size={16} />,
  },
  {
    label: 'Trend charts & insights',
    free: false,
    pro: true,
    icon: <TrendingUp size={16} />,
  },
  {
    label: 'Weekly summary reports',
    free: false,
    pro: true,
    icon: <FileText size={16} />,
  },
  {
    label: 'Priority support',
    free: false,
    pro: true,
    icon: <Headphones size={16} />,
  },
]

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function UpgradeContent({
  isProActive,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: UpgradeContentProps) {
  const [isYearly, setIsYearly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  /* ---------------------------------------------------------------- */
  /*  Computed pricing                                                 */
  /* ---------------------------------------------------------------- */
  const monthlyEquivalent = isYearly
    ? (PRO_PLAN.priceYearly / 12).toFixed(2)
    : PRO_PLAN.priceMonthly.toFixed(2)

  const yearlySavings = Math.round(
    ((PRO_PLAN.priceMonthly * 12 - PRO_PLAN.priceYearly) /
      (PRO_PLAN.priceMonthly * 12)) *
      100,
  )

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */

  async function handleSubscribe() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interval: isYearly ? 'yearly' : 'monthly',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong'
      toast.error(message)
      setIsLoading(false)
    }
  }

  async function handleManageSubscription() {
    setIsPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to open billing portal')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong'
      toast.error(message)
      setIsPortalLoading(false)
    }
  }

  /* ================================================================ */
  /*  Already Pro -- show management view                              */
  /* ================================================================ */

  if (isProActive) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-yellow-400">
            <Crown size={32} className="text-amber-800" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--fl-text)]">
            You&apos;re on Pro!
          </h2>
          <p className="mt-2 text-[var(--fl-text-secondary)]">
            You have full access to all FastLane features.
          </p>
        </div>

        {/* Subscription details */}
        <Card padding="lg">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
                Plan
              </span>
              <Badge variant="pro" size="md">
                <span className="flex items-center gap-1">
                  <Crown size={12} />
                  Pro
                </span>
              </Badge>
            </div>

            {currentPeriodEnd && (
              <div className="flex items-center justify-between border-t border-[var(--fl-border)] pt-4">
                <span className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
                  {cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}
                </span>
                <span className="text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
                  {formatDate(currentPeriodEnd)}
                </span>
              </div>
            )}

            {cancelAtPeriodEnd && (
              <div className="rounded-[var(--fl-radius-md)] bg-amber-50 p-3 dark:bg-amber-500/10">
                <p className="text-[var(--fl-text-sm)] text-amber-800 dark:text-amber-400">
                  Your subscription is set to cancel at the end of the current
                  billing period. You can reactivate it from the billing portal.
                </p>
              </div>
            )}

            <div className="border-t border-[var(--fl-border)] pt-4">
              <Button
                variant="outline"
                size="md"
                fullWidth
                rightIcon={<ExternalLink size={16} />}
                loading={isPortalLoading}
                onClick={handleManageSubscription}
              >
                Manage Subscription
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  /* ================================================================ */
  /*  Free user -- show upgrade view                                   */
  /* ================================================================ */

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* ------------------------------------------------------------ */}
      {/*  Header                                                       */}
      {/* ------------------------------------------------------------ */}
      <div className="text-center">
        <Badge variant="pro" size="md" className="mb-4">
          <span className="flex items-center gap-1">
            <Crown size={12} />
            Pro
          </span>
        </Badge>
        <h2 className="text-2xl font-bold text-[var(--fl-text)] sm:text-3xl">
          Unlock your full fasting potential
        </h2>
        <p className="mt-3 text-[var(--fl-text-secondary)]">
          Get advanced analytics, all protocols, and unlimited history.
        </p>
      </div>

      {/* ------------------------------------------------------------ */}
      {/*  Billing toggle                                               */}
      {/* ------------------------------------------------------------ */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={cn(
            'text-sm font-medium transition-colors',
            !isYearly
              ? 'text-[var(--fl-text)]'
              : 'text-[var(--fl-text-secondary)]',
          )}
        >
          Monthly
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={isYearly}
          aria-label="Toggle yearly billing"
          onClick={() => setIsYearly((prev) => !prev)}
          className={cn(
            'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
            'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)] focus-visible:ring-offset-2',
            isYearly
              ? 'bg-[var(--fl-primary)]'
              : 'bg-[var(--fl-bg-tertiary)]',
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0',
              'transition-transform duration-200',
              isYearly ? 'translate-x-5.5' : 'translate-x-0.5',
            )}
          />
        </button>

        <span
          className={cn(
            'text-sm font-medium transition-colors',
            isYearly
              ? 'text-[var(--fl-text)]'
              : 'text-[var(--fl-text-secondary)]',
          )}
        >
          Yearly
        </span>

        {isYearly && (
          <span className="rounded-full bg-[var(--fl-green-100)] px-2.5 py-0.5 text-xs font-semibold text-[var(--fl-green-800)]">
            Save {yearlySavings}%
          </span>
        )}
      </div>

      {/* ------------------------------------------------------------ */}
      {/*  Pricing card                                                 */}
      {/* ------------------------------------------------------------ */}
      <Card
        padding="lg"
        className="mx-auto max-w-md border-[var(--fl-primary)] shadow-lg"
      >
        <div className="text-center">
          {/* Price */}
          <div className="mb-2">
            <span className="text-4xl font-extrabold tracking-tight text-[var(--fl-text)]">
              ${monthlyEquivalent}
            </span>
            <span className="ml-1 text-[var(--fl-text-secondary)]">/month</span>
          </div>
          {isYearly && (
            <p className="mb-4 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
              Billed ${PRO_PLAN.priceYearly.toFixed(2)}/year
            </p>
          )}
          {!isYearly && (
            <p className="mb-4 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
              Billed monthly
            </p>
          )}

          {/* Subscribe button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<Crown size={20} />}
            loading={isLoading}
            onClick={handleSubscribe}
          >
            Subscribe to Pro
          </Button>

          {/* Money-back guarantee */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
            <Shield size={14} className="text-[var(--fl-primary)]" />
            <span>7-day money-back guarantee</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-[var(--fl-border)]" />

        {/* Feature list */}
        <ul className="flex flex-col gap-3">
          {PRO_PLAN.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--fl-green-100)]">
                <Check size={12} className="text-[var(--fl-green-800)]" />
              </div>
              <span className="text-[var(--fl-text-sm)] text-[var(--fl-text)]">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* ------------------------------------------------------------ */}
      {/*  Feature comparison table                                     */}
      {/* ------------------------------------------------------------ */}
      <div>
        <h3 className="mb-4 text-center text-lg font-semibold text-[var(--fl-text)]">
          Free vs Pro comparison
        </h3>
        <Card padding="none" className="overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_80px] gap-2 border-b border-[var(--fl-border)] bg-[var(--fl-bg-secondary)] px-4 py-3 sm:grid-cols-[1fr_100px_100px]">
            <span className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text)]">
              Feature
            </span>
            <span className="text-center text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text-secondary)]">
              Free
            </span>
            <span className="text-center text-[var(--fl-text-sm)] font-semibold text-[var(--fl-primary)]">
              Pro
            </span>
          </div>

          {/* Table rows */}
          {comparisonFeatures.map((feature, idx) => (
            <div
              key={feature.label}
              className={cn(
                'grid grid-cols-[1fr_80px_80px] items-center gap-2 px-4 py-3 sm:grid-cols-[1fr_100px_100px]',
                idx !== comparisonFeatures.length - 1 &&
                  'border-b border-[var(--fl-border)]',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-[var(--fl-text-secondary)]">
                  {feature.icon}
                </span>
                <span className="text-[var(--fl-text-sm)] text-[var(--fl-text)]">
                  {feature.label}
                </span>
              </div>
              <div className="flex justify-center">
                <FeatureValue value={feature.free} />
              </div>
              <div className="flex justify-center">
                <FeatureValue value={feature.pro} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* ------------------------------------------------------------ */}
      {/*  FAQ / trust signals                                          */}
      {/* ------------------------------------------------------------ */}
      <div className="mx-auto max-w-md space-y-3 text-center">
        <p className="text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
          Cancel anytime from your account settings. No hidden fees. Your
          fasting data is always yours, even if you downgrade.
        </p>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Helper: feature value display in comparison table                  */
/* ================================================================== */

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return (
      <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
        {value}
      </span>
    )
  }
  if (value) {
    return (
      <Check
        size={18}
        className="text-[var(--fl-primary)]"
        aria-label="Included"
      />
    )
  }
  return (
    <span
      className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]"
      aria-label="Not included"
    >
      --
    </span>
  )
}
