'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pro';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size preset */
  size?: BadgeSize;
}

/* ------------------------------------------------------------------ */
/*  Maps                                                               */
/* ------------------------------------------------------------------ */

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--fl-bg-tertiary)] text-[var(--fl-text-secondary)]',
  success:
    'bg-[var(--fl-green-100)] text-[var(--fl-green-800)]',
  warning:
    'bg-amber-100 text-amber-800',
  danger:
    'bg-red-100 text-red-800',
  info:
    'bg-blue-100 text-blue-800',
  pro:
    'bg-gradient-to-r from-amber-200 to-yellow-300 text-amber-900',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[0.6875rem] leading-tight',
  md: 'px-2.5 py-0.5 text-[var(--fl-text-xs)] leading-normal',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className, children, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-[var(--fl-radius-full)] whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
