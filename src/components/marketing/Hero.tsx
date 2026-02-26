'use client';

import Link from 'next/link';
import { ArrowRight, Star, Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Timer Visual                                                       */
/* ------------------------------------------------------------------ */

function TimerVisual({ className }: { className?: string }) {
  const progress = 67; // 16:08 into a 24h cycle => ~67%
  const radius = 120;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        className,
      )}
      aria-hidden="true"
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl" />

      <svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        className="timer-glow drop-shadow-lg"
      >
        {/* Background track */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="var(--fl-gray-200)"
          strokeWidth={strokeWidth}
          className="dark:stroke-gray-800"
        />

        {/* Progress arc */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="var(--fl-green-500)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${radius} ${radius})`}
          className="transition-all duration-1000 ease-out"
        />

        {/* Inner ring accent */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius - 20}
          fill="none"
          stroke="var(--fl-green-500)"
          strokeWidth={1}
          opacity={0.15}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-medium text-foreground-secondary uppercase tracking-wider">
          Fasting
        </span>
        <span className="text-5xl font-bold tracking-tight text-foreground tabular-nums">
          16:08
        </span>
        <span className="text-sm text-foreground-secondary">
          of 24:00 goal
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats Item                                                         */
/* ------------------------------------------------------------------ */

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-sm text-foreground-secondary">{label}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Component                                                     */
/* ------------------------------------------------------------------ */

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-background"
      aria-labelledby="hero-heading"
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--fl-gray-100)_1px,transparent_1px),linear-gradient(to_bottom,var(--fl-gray-100)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 dark:opacity-10"
        aria-hidden="true"
      />

      {/* Gradient accent */}
      <div
        className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
        {/* Main content grid */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Copy */}
          <div className="max-w-xl">
            <h1
              id="hero-heading"
              className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Your Fasting Journey,{' '}
              <span className="text-emerald-500">Simplified</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-foreground-secondary sm:text-xl">
              Track, optimize, and master intermittent fasting with a beautiful
              timer, smart protocols, and insights that keep you motivated.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/try"
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3',
                  'bg-emerald-500 text-white font-semibold text-base',
                  'shadow-lg shadow-emerald-500/25',
                  'transition-all duration-200',
                  'hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                )}
              >
                Start Fasting Now
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/register"
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3',
                  'border border-border bg-transparent font-semibold text-base text-foreground',
                  'transition-all duration-200',
                  'hover:bg-background-secondary hover:border-border-hover',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                )}
              >
                Create Free Account
              </Link>
            </div>
          </div>

          {/* Right: Timer Visual */}
          <div className="flex items-center justify-center lg:justify-end">
            <TimerVisual className="h-[280px] w-[280px] sm:h-[320px] sm:w-[320px]" />
          </div>
        </div>

        {/* Stats bar */}
        <div
          className={cn(
            'mt-16 grid grid-cols-1 gap-8 rounded-2xl border border-border bg-background p-6',
            'sm:grid-cols-3 sm:gap-4 sm:p-8',
            'shadow-sm',
          )}
          aria-label="App statistics"
        >
          <StatItem
            icon={<Users className="h-5 w-5" />}
            value="10,000+"
            label="Active Fasters"
          />
          <StatItem
            icon={<Trophy className="h-5 w-5" />}
            value="500,000+"
            label="Fasts Completed"
          />
          <StatItem
            icon={<Star className="h-5 w-5" />}
            value="4.9\u2605"
            label="App Rating"
          />
        </div>
      </div>
    </section>
  );
}
