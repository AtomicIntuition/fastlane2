'use client';

import {
  Timer,
  Zap,
  Flame,
  Heart,
  BarChart3,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Feature data                                                       */
/* ------------------------------------------------------------------ */

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;       // Tailwind bg class for icon circle
  iconColor: string;   // Tailwind text class for icon
}

const features: Feature[] = [
  {
    icon: Timer,
    title: 'Smart Timer',
    description:
      'Beautiful circular timer with notifications that keeps you on track throughout your fast.',
    color: 'bg-emerald-100 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Zap,
    title: 'Proven Protocols',
    description:
      'Choose from 8 science-backed fasting schedules, from 12:12 all the way to extended fasts.',
    color: 'bg-amber-100 dark:bg-amber-500/15',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: Flame,
    title: 'Streak Tracking',
    description:
      'Build consistency with daily streaks and goals that keep you coming back every day.',
    color: 'bg-orange-100 dark:bg-orange-500/15',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    icon: Heart,
    title: 'Daily Check-ins',
    description:
      'Track mood, hunger, and energy levels to understand how fasting affects your body.',
    color: 'bg-rose-100 dark:bg-rose-500/15',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Visualize your progress with charts and heatmaps that reveal patterns and milestones.',
    color: 'bg-blue-100 dark:bg-blue-500/15',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Wifi,
    title: 'Works Offline',
    description:
      'Full PWA that works without internet connection so you can fast anywhere, anytime.',
    color: 'bg-violet-100 dark:bg-violet-500/15',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
];

/* ------------------------------------------------------------------ */
/*  Feature Card                                                       */
/* ------------------------------------------------------------------ */

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl border border-border bg-background p-6',
        'transition-all duration-200',
        'hover:shadow-md hover:border-border-hover hover:-translate-y-0.5',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl',
          feature.color,
        )}
      >
        <Icon className={cn('h-6 w-6', feature.iconColor)} />
      </div>

      {/* Text */}
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
        {feature.description}
      </p>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Features Section                                                   */
/* ------------------------------------------------------------------ */

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-background-secondary py-20 sm:py-28"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-500">
            Features
          </p>
          <h2
            id="features-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Everything you need to fast smarter
          </h2>
          <p className="mt-4 text-lg text-foreground-secondary">
            Powerful tools wrapped in a simple, beautiful interface designed to
            make intermittent fasting a sustainable part of your life.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
