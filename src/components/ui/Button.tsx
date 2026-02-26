'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Variant + Size maps                                                */
/* ------------------------------------------------------------------ */

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--fl-primary)] text-[var(--fl-text-inverse)] hover:bg-[var(--fl-primary-hover)] focus-visible:ring-[var(--fl-primary)]',
  secondary:
    'bg-[var(--fl-secondary)] text-[var(--fl-text-inverse)] hover:bg-[var(--fl-secondary-hover)] focus-visible:ring-[var(--fl-secondary)]',
  outline:
    'border border-[var(--fl-border)] bg-transparent text-[var(--fl-text)] hover:bg-[var(--fl-bg-secondary)] hover:border-[var(--fl-border-hover)] focus-visible:ring-[var(--fl-primary)]',
  ghost:
    'bg-transparent text-[var(--fl-text)] hover:bg-[var(--fl-bg-secondary)] focus-visible:ring-[var(--fl-primary)]',
  danger:
    'bg-[var(--fl-danger)] text-[var(--fl-text-inverse)] hover:bg-[var(--fl-danger-hover)] focus-visible:ring-[var(--fl-danger)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[var(--fl-text-sm)] gap-1.5 rounded-[var(--fl-radius-sm)]',
  md: 'h-10 px-4 text-[var(--fl-text-base)] gap-2 rounded-[var(--fl-radius-md)]',
  lg: 'h-12 px-6 text-[var(--fl-text-lg)] gap-2.5 rounded-[var(--fl-radius-lg)]',
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show a loading spinner and disable the button */
  loading?: boolean;
  /** Stretch to fill parent width */
  fullWidth?: boolean;
  /** Icon element rendered before children */
  leftIcon?: ReactNode;
  /** Icon element rendered after children */
  rightIcon?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-[var(--fl-transition-fast)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'select-none whitespace-nowrap',
          // Dynamic styles
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...rest}
      >
        {loading ? (
          <Loader2 className="shrink-0 animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}

        {children}

        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
