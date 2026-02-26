'use client';

import { forwardRef, type InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label */
  label?: string;
  /** Label shown at the min end of the track */
  minLabel?: string;
  /** Label shown at the max end of the track */
  maxLabel?: string;
  /** Show the current numeric value above the slider */
  showValue?: boolean;
  /** Format the displayed value (e.g. append "h") */
  formatValue?: (value: number) => string;
  /** Extra classes for the outer wrapper */
  wrapperClassName?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      minLabel,
      maxLabel,
      showValue = false,
      formatValue,
      className,
      wrapperClassName,
      id: externalId,
      min = 0,
      max = 100,
      value,
      defaultValue,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const id = externalId ?? autoId;

    // Resolve displayed value from controlled or uncontrolled source
    const displayValue = value ?? defaultValue ?? min;
    const numericValue = Number(displayValue);
    const formatted = formatValue ? formatValue(numericValue) : String(numericValue);

    // Percentage for the filled track
    const pct = ((numericValue - Number(min)) / (Number(max) - Number(min))) * 100;

    return (
      <div className={cn('flex flex-col gap-2', wrapperClassName)}>
        {/* Header row: label + value */}
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={id}
                className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]"
              >
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-[var(--fl-text-sm)] font-semibold tabular-nums text-[var(--fl-primary)]">
                {formatted}
              </span>
            )}
          </div>
        )}

        {/* Slider input */}
        <input
          ref={ref}
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            'w-full cursor-pointer appearance-none bg-transparent',
            // Track
            '[&::-webkit-slider-runnable-track]:h-2',
            '[&::-webkit-slider-runnable-track]:rounded-[var(--fl-radius-full)]',
            '[&::-webkit-slider-runnable-track]:bg-[var(--fl-bg-tertiary)]',
            // Filled track via gradient
            '[&::-webkit-slider-runnable-track]:bg-gradient-to-r',
            '[&::-webkit-slider-runnable-track]:from-[var(--fl-primary)]',
            '[&::-webkit-slider-runnable-track]:to-[var(--fl-primary)]',
            // Thumb
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:mt-[-4px]',
            '[&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:border-2',
            '[&::-webkit-slider-thumb]:border-[var(--fl-primary)]',
            '[&::-webkit-slider-thumb]:shadow-[var(--fl-shadow-sm)]',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:duration-[var(--fl-transition-fast)]',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            // Firefox track
            '[&::-moz-range-track]:h-2',
            '[&::-moz-range-track]:rounded-[var(--fl-radius-full)]',
            '[&::-moz-range-track]:bg-[var(--fl-bg-tertiary)]',
            // Firefox filled portion
            '[&::-moz-range-progress]:h-2',
            '[&::-moz-range-progress]:rounded-[var(--fl-radius-full)]',
            '[&::-moz-range-progress]:bg-[var(--fl-primary)]',
            // Firefox thumb
            '[&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:w-4',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:border-2',
            '[&::-moz-range-thumb]:border-[var(--fl-primary)]',
            '[&::-moz-range-thumb]:bg-white',
            // Focus
            'focus-visible:outline-none',
            '[&:focus-visible::-webkit-slider-thumb]:ring-2',
            '[&:focus-visible::-webkit-slider-thumb]:ring-[var(--fl-primary)]',
            '[&:focus-visible::-webkit-slider-thumb]:ring-offset-2',
            className,
          )}
          style={
            {
              '--slider-pct': `${pct}%`,
              backgroundSize: `${pct}% 100%`,
            } as React.CSSProperties
          }
          {...rest}
        />

        {/* Min / Max labels */}
        {(minLabel || maxLabel) && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
              {minLabel}
            </span>
            <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
              {maxLabel}
            </span>
          </div>
        )}
      </div>
    );
  },
);

Slider.displayName = 'Slider';
