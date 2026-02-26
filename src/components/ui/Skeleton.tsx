'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape variant */
  variant?: SkeletonVariant;
  /**
   * Preset width for text variant:
   *  - 'full' (default) = 100%
   *  - 'lg'  = 75%
   *  - 'md'  = 50%
   *  - 'sm'  = 25%
   *
   * Ignored when className contains a width override.
   */
  width?: 'full' | 'lg' | 'md' | 'sm';
}

/* ------------------------------------------------------------------ */
/*  Width map (text variant only)                                      */
/* ------------------------------------------------------------------ */

const textWidthStyles: Record<string, string> = {
  full: 'w-full',
  lg: 'w-3/4',
  md: 'w-1/2',
  sm: 'w-1/4',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', width = 'full', className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          // Pulse animation
          'animate-pulse bg-[var(--fl-bg-tertiary)]',
          // Variant-specific defaults
          variant === 'text' && [
            'h-4 rounded-[var(--fl-radius-sm)]',
            textWidthStyles[width],
          ],
          variant === 'circular' && 'h-10 w-10 rounded-full',
          variant === 'rectangular' && 'h-24 w-full rounded-[var(--fl-radius-md)]',
          // Consumer override
          className,
        )}
        {...rest}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';
