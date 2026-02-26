'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ProgressColor = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value (0 – 100) */
  value: number;
  /** Max value (defaults to 100) */
  max?: number;
  /** Color variant for the filled bar */
  color?: ProgressColor;
  /** Optional label rendered above the bar */
  label?: string;
  /** Show percentage text to the right of the bar */
  showPercentage?: boolean;
  /** Height of the track (Tailwind class, e.g. "h-2") */
  trackHeight?: string;
}

/* ------------------------------------------------------------------ */
/*  Color map                                                          */
/* ------------------------------------------------------------------ */

const colorStyles: Record<ProgressColor, string> = {
  primary: 'bg-[var(--fl-primary)]',
  success: 'bg-[var(--fl-success)]',
  warning: 'bg-[var(--fl-warning)]',
  danger: 'bg-[var(--fl-danger)]',
  info: 'bg-[var(--fl-info)]',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      color = 'primary',
      label,
      showPercentage = false,
      trackHeight = 'h-2',
      className,
      ...rest
    },
    ref,
  ) => {
    const clamped = Math.min(Math.max(0, value), max);
    const pct = Math.round((clamped / max) * 100);

    return (
      <div ref={ref} className={cn('w-full', className)} {...rest}>
        {/* Label row */}
        {(label || showPercentage) && (
          <div className="mb-1.5 flex items-center justify-between">
            {label && (
              <span className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
                {label}
              </span>
            )}
            {showPercentage && (
              <span className="text-[var(--fl-text-sm)] tabular-nums text-[var(--fl-text-secondary)]">
                {pct}%
              </span>
            )}
          </div>
        )}

        {/* Track */}
        <div
          className={cn(
            'w-full overflow-hidden rounded-[var(--fl-radius-full)] bg-[var(--fl-bg-tertiary)]',
            trackHeight,
          )}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label ?? 'Progress'}
        >
          {/* Fill */}
          <div
            className={cn(
              'h-full rounded-[var(--fl-radius-full)] transition-[width] duration-500 ease-out',
              colorStyles[color],
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  },
);

Progress.displayName = 'Progress';
