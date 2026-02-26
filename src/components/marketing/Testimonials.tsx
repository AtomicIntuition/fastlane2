'use client';

import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Testimonial data                                                   */
/* ------------------------------------------------------------------ */

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "FastLane made intermittent fasting click for me. The timer is gorgeous, and the streak tracking keeps me accountable. I've been doing 16:8 for three months straight without missing a day.",
    name: 'Sarah Mitchell',
    role: 'Yoga Instructor',
    initials: 'SM',
    avatarColor: 'bg-emerald-500',
  },
  {
    quote:
      "As someone who's tried every fasting app out there, FastLane is the only one I've stuck with. The check-ins helped me realize that my energy actually peaks during fasting hours. Game changer.",
    name: 'David Chen',
    role: 'Software Engineer',
    initials: 'DC',
    avatarColor: 'bg-blue-500',
  },
  {
    quote:
      "I recommend FastLane to all my clients who are starting intermittent fasting. The protocol library and analytics make it easy for beginners to find what works, and the offline support means it's always available.",
    name: 'Dr. Amara Okafor',
    role: 'Nutritionist',
    initials: 'AO',
    avatarColor: 'bg-violet-500',
  },
];

/* ------------------------------------------------------------------ */
/*  Testimonial Card                                                   */
/* ------------------------------------------------------------------ */

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article
      className={cn(
        'relative flex flex-col rounded-2xl border border-border bg-background p-6 sm:p-8',
        'shadow-sm transition-shadow duration-200 hover:shadow-md',
      )}
    >
      {/* Quote icon */}
      <Quote
        className="h-8 w-8 text-emerald-500/20"
        aria-hidden="true"
      />

      {/* Quote text */}
      <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground-secondary">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
        {/* Avatar placeholder */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
            testimonial.avatarColor,
          )}
          aria-hidden="true"
        >
          {testimonial.initials}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            {testimonial.name}
          </p>
          <p className="text-sm text-foreground-secondary">
            {testimonial.role}
          </p>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials Section                                               */
/* ------------------------------------------------------------------ */

export function Testimonials() {
  return (
    <section
      className="bg-background py-20 sm:py-28"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-500">
            Testimonials
          </p>
          <h2
            id="testimonials-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Loved by fasters worldwide
          </h2>
          <p className="mt-4 text-lg text-foreground-secondary">
            Hear from people who transformed their fasting routine with
            FastLane.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
