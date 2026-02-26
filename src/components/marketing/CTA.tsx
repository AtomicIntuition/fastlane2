'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Final CTA Section                                                  */
/* ------------------------------------------------------------------ */

export function CTA() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 py-20 sm:py-28"
      aria-labelledby="cta-heading"
    >
      {/* Decorative elements */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2
          id="cta-heading"
          className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          Ready to transform your health?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-emerald-100">
          Join thousands of fasters who&apos;ve made intermittent fasting a
          sustainable habit.
        </p>

        <div className="mt-10">
          <Link
            href="/register"
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4',
              'bg-white text-emerald-700 font-bold text-lg',
              'shadow-xl shadow-emerald-900/20',
              'transition-all duration-200',
              'hover:bg-emerald-50 hover:shadow-2xl',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600',
            )}
          >
            Start Your Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <p className="mt-4 text-sm text-emerald-200">
          No credit card required. Free forever on the basic plan.
        </p>
      </div>
    </section>
  );
}
