'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CardVariant = 'default' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Inner content padding */
  padding?: CardPadding;
  /** Optional header rendered above body content */
  header?: ReactNode;
  /** Optional footer rendered below body content */
  footer?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Maps                                                               */
/* ------------------------------------------------------------------ */

const variantStyles: Record<CardVariant, string> = {
  default: 'border border-[var(--fl-border)] bg-[var(--fl-bg)]',
  elevated: 'border-0 bg-[var(--fl-bg-elevated)] shadow-[var(--fl-shadow-md)]',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', header, footer, className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--fl-radius-lg)] overflow-hidden',
          variantStyles[variant],
          className,
        )}
        {...rest}
      >
        {/* Header */}
        {header && (
          <div className="border-b border-[var(--fl-border)] px-4 py-3 sm:px-6">
            {typeof header === 'string' ? (
              <h3 className="text-[var(--fl-text-lg)] font-semibold text-[var(--fl-text)]">
                {header}
              </h3>
            ) : (
              header
            )}
          </div>
        )}

        {/* Body */}
        <div className={cn(paddingStyles[padding])}>{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-[var(--fl-border)] px-4 py-3 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    );
  },
);

Card.displayName = 'Card';
