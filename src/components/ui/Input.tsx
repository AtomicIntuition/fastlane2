'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label rendered above the input */
  label?: string;
  /** Error message – also sets aria-invalid */
  error?: string;
  /** Helper text rendered below the input (hidden when error is shown) */
  helperText?: string;
  /** Icon / element on the left side of the input */
  leftIcon?: ReactNode;
  /** Icon / element on the right side of the input */
  rightIcon?: ReactNode;
  /** Size preset */
  size?: InputSize;
  /** Extra classes for the outer wrapper */
  wrapperClassName?: string;
}

/* ------------------------------------------------------------------ */
/*  Size maps                                                          */
/* ------------------------------------------------------------------ */

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 text-[var(--fl-text-sm)] rounded-[var(--fl-radius-sm)]',
  md: 'h-10 text-[var(--fl-text-base)] rounded-[var(--fl-radius-md)]',
  lg: 'h-12 text-[var(--fl-text-lg)] rounded-[var(--fl-radius-lg)]',
};

const iconPadding: Record<InputSize, { left: string; right: string }> = {
  sm: { left: 'pl-8', right: 'pr-8' },
  md: { left: 'pl-10', right: 'pr-10' },
  lg: { left: 'pl-12', right: 'pr-12' },
};

const iconSizeClass: Record<InputSize, string> = {
  sm: '[&>svg]:size-3.5',
  md: '[&>svg]:size-4',
  lg: '[&>svg]:size-5',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = 'md',
      disabled,
      className,
      wrapperClassName,
      id: externalId,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const id = externalId ?? autoId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <span
              className={cn(
                'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--fl-text-tertiary)]',
                iconSizeClass[size],
              )}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              // Base
              'w-full border bg-[var(--fl-bg)] px-3 text-[var(--fl-text)] placeholder:text-[var(--fl-text-tertiary)]',
              'transition-colors duration-[var(--fl-transition-fast)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--fl-border-focus)] focus:border-[var(--fl-border-focus)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Border color
              hasError
                ? 'border-[var(--fl-danger)] focus:ring-[var(--fl-danger)]'
                : 'border-[var(--fl-border)] hover:border-[var(--fl-border-hover)]',
              // Size
              sizeStyles[size],
              // Icon padding
              leftIcon && iconPadding[size].left,
              rightIcon && iconPadding[size].right,
              className,
            )}
            {...rest}
          />

          {/* Right icon */}
          {rightIcon && (
            <span
              className={cn(
                'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--fl-text-tertiary)]',
                iconSizeClass[size],
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p id={errorId} role="alert" className="text-[var(--fl-text-sm)] text-[var(--fl-danger)]">
            {error}
          </p>
        )}

        {/* Helper text (hidden when error is present) */}
        {!hasError && helperText && (
          <p id={helperId} className="text-[var(--fl-text-sm)] text-[var(--fl-text-tertiary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
