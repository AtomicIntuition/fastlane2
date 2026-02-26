'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { FREE_PLAN, PRO_PLAN, type Plan } from '@/lib/stripe/plans';

/* ------------------------------------------------------------------ */
/*  Billing toggle                                                     */
/* ------------------------------------------------------------------ */

interface BillingToggleProps {
  isYearly: boolean;
  onToggle: () => void;
}

function BillingToggle({ isYearly, onToggle }: BillingToggleProps) {
  const yearlySavings = Math.round(
    ((PRO_PLAN.priceMonthly * 12 - PRO_PLAN.priceYearly) /
      (PRO_PLAN.priceMonthly * 12)) *
      100,
  );

  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className={cn(
          'text-sm font-medium transition-colors',
          !isYearly ? 'text-foreground' : 'text-foreground-secondary',
        )}
      >
        Monthly
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={isYearly}
        aria-label="Toggle yearly billing"
        onClick={onToggle}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
          'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
          isYearly ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700',
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
          isYearly ? 'text-foreground' : 'text-foreground-secondary',
        )}
      >
        Yearly
      </span>

      {isYearly && (
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
          Save {yearlySavings}%
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature comparison list                                            */
/* ------------------------------------------------------------------ */

interface ComparisonFeature {
  label: string;
  free: boolean | string;
  pro: boolean | string;
}

const comparisonFeatures: ComparisonFeature[] = [
  { label: 'Fasting protocols', free: '4 basic', pro: 'All 8 + custom' },
  { label: 'Timer with notifications', free: true, pro: true },
  { label: 'Daily check-ins', free: true, pro: true },
  { label: 'Fasting history', free: '7 days', pro: 'Unlimited' },
  { label: 'Streak tracking', free: 'Current only', pro: 'Full statistics' },
  { label: 'Calendar heatmap', free: false, pro: true },
  { label: 'Trend charts & insights', free: false, pro: true },
  { label: 'Weekly summary reports', free: false, pro: true },
  { label: 'Priority support', free: false, pro: true },
];

/* ------------------------------------------------------------------ */
/*  Price display                                                      */
/* ------------------------------------------------------------------ */

function PriceDisplay({
  plan,
  isYearly,
}: {
  plan: Plan;
  isYearly: boolean;
}) {
  if (plan.priceMonthly === 0) {
    return (
      <div className="mt-6">
        <span className="text-5xl font-extrabold tracking-tight text-foreground">
          $0
        </span>
        <span className="ml-1 text-base text-foreground-secondary">/month</span>
      </div>
    );
  }

  const monthlyEquivalent = isYearly
    ? (plan.priceYearly / 12).toFixed(2)
    : plan.priceMonthly.toFixed(2);

  return (
    <div className="mt-6">
      <span className="text-5xl font-extrabold tracking-tight text-foreground">
        ${monthlyEquivalent}
      </span>
      <span className="ml-1 text-base text-foreground-secondary">/month</span>
      {isYearly && (
        <p className="mt-1 text-sm text-foreground-secondary">
          Billed ${plan.priceYearly.toFixed(2)}/year
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature value cell                                                 */
/* ------------------------------------------------------------------ */

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return (
      <span className="text-sm text-foreground-secondary">{value}</span>
    );
  }
  if (value) {
    return (
      <Check
        className="h-5 w-5 text-emerald-500"
        aria-label="Included"
      />
    );
  }
  return (
    <X
      className="h-5 w-5 text-foreground-tertiary"
      aria-label="Not included"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing Card                                                       */
/* ------------------------------------------------------------------ */

interface PricingCardProps {
  plan: Plan;
  isYearly: boolean;
  features: ComparisonFeature[];
  valueKey: 'free' | 'pro';
}

function PricingCard({ plan, isYearly, features, valueKey }: PricingCardProps) {
  const isHighlighted = plan.highlighted;

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-8',
        'transition-shadow duration-200',
        isHighlighted
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/10'
          : 'border-border shadow-sm',
      )}
    >
      {/* Most Popular badge */}
      {isHighlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan info */}
      <div>
        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
        <p className="mt-1 text-sm text-foreground-secondary">
          {plan.description}
        </p>
      </div>

      {/* Price */}
      <PriceDisplay plan={plan} isYearly={isYearly} />

      {/* CTA */}
      <Link
        href={plan.id === 'free' ? '/register' : '/register?plan=pro'}
        className={cn(
          'mt-8 inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
          isHighlighted
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600'
            : 'border border-border bg-transparent text-foreground hover:bg-background-secondary',
        )}
      >
        {plan.id === 'free' ? 'Get Started' : 'Start Pro Trial'}
      </Link>

      {/* Divider */}
      <div className="my-8 h-px bg-border" />

      {/* Feature list */}
      <ul className="flex flex-col gap-4" role="list">
        {features.map((feature) => (
          <li
            key={feature.label}
            className="flex items-center justify-between gap-3"
          >
            <span className="text-sm text-foreground">
              {feature.label}
            </span>
            <FeatureValue value={feature[valueKey]} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing Table Section                                              */
/* ------------------------------------------------------------------ */

export function PricingTable() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-background-secondary py-20 sm:py-28"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-500">
            Pricing
          </p>
          <h2
            id="pricing-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-foreground-secondary">
            Start free and upgrade when you&apos;re ready. No hidden fees, cancel
            anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-10">
          <BillingToggle
            isYearly={isYearly}
            onToggle={() => setIsYearly((prev) => !prev)}
          />
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-2">
          <PricingCard
            plan={FREE_PLAN}
            isYearly={isYearly}
            features={comparisonFeatures}
            valueKey="free"
          />
          <PricingCard
            plan={PRO_PLAN}
            isYearly={isYearly}
            features={comparisonFeatures}
            valueKey="pro"
          />
        </div>
      </div>
    </section>
  );
}
