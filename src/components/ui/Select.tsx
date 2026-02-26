'use client';

import { forwardRef, type SelectHTMLAttributes, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Visible label */
  label?: string;
  /** Error message – also sets aria-invalid */
  error?: string;
  /** Helper text rendered below the select (hidden when error is shown) */
  helperText?: string;
  /** Size preset */
  size?: SelectSize;
  /** Placeholder option (shown when no value selected) */
  placeholder?: string;
  /** Extra classes for the outer wrapper */
  wrapperClassName?: string;
}

/* ------------------------------------------------------------------ */
/*  Size map                                                           */
/* ------------------------------------------------------------------ */

const sizeStyles: Record<SelectSize, string> = {
  sm: 'h-8 text-[var(--fl-text-sm)] rounded-[var(--fl-radius-sm)] pr-8',
  md: 'h-10 text-[var(--fl-text-base)] rounded-[var(--fl-radius-md)] pr-10',
  lg: 'h-12 text-[var(--fl-text-lg)] rounded-[var(--fl-radius-lg)] pr-12',
};

const chevronSize: Record<SelectSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      placeholder,
      disabled,
      className,
      wrapperClassName,
      children,
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
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              // Base
              'w-full appearance-none border bg-[var(--fl-bg)] pl-3 text-[var(--fl-text)]',
              'transition-colors duration-[var(--fl-transition-fast)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--fl-border-focus)] focus:border-[var(--fl-border-focus)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Border
              hasError
                ? 'border-[var(--fl-danger)] focus:ring-[var(--fl-danger)]'
                : 'border-[var(--fl-border)] hover:border-[var(--fl-border-hover)]',
              // Size
              sizeStyles[size],
              className,
            )}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          {/* Chevron icon */}
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--fl-text-tertiary)]">
            <ChevronDown size={chevronSize[size]} />
          </span>
        </div>

        {/* Error */}
        {hasError && (
          <p id={errorId} role="alert" className="text-[var(--fl-text-sm)] text-[var(--fl-danger)]">
            {error}
          </p>
        )}

        {/* Helper text */}
        {!hasError && helperText && (
          <p id={helperId} className="text-[var(--fl-text-sm)] text-[var(--fl-text-tertiary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
