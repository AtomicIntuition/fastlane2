'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type StreakBadgeVariant = 'small' | 'large'

export interface StreakBadgeProps {
  /** Current streak count */
  streak: number
  /** Display variant */
  variant?: StreakBadgeVariant
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StreakBadge({
  streak,
  variant = 'small',
  className,
}: StreakBadgeProps) {
  const isLarge = variant === 'large'
  const isAnimated = streak > 7

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5',
        isLarge ? 'gap-2' : 'gap-1',
        className,
      )}
    >
      {/* Flame icon */}
      <div className="relative">
        <Flame
          size={isLarge ? 28 : 18}
          className={cn(
            streak > 0
              ? 'fill-orange-400 text-orange-500'
              : 'fill-none text-[var(--fl-text-tertiary)]',
            isAnimated && 'animate-bounce',
          )}
          style={
            isAnimated
              ? { animationDuration: '1.5s', animationIterationCount: 'infinite' }
              : undefined
          }
        />
        {/* Glow effect for animated streaks */}
        {isAnimated && (
          <Flame
            size={isLarge ? 28 : 18}
            className="absolute inset-0 fill-orange-400 text-orange-500 opacity-40 blur-sm"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Streak number + label */}
      <div className={cn('flex items-baseline gap-1', isLarge && 'flex-col gap-0')}>
        <span
          className={cn(
            'font-bold tabular-nums',
            isLarge
              ? 'text-2xl text-[var(--fl-text)]'
              : 'text-[var(--fl-text-sm)] text-[var(--fl-text)]',
          )}
        >
          {streak}
        </span>
        <span
          className={cn(
            'font-medium',
            isLarge
              ? 'text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]'
              : 'text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]',
          )}
        >
          day{streak !== 1 ? 's' : ''} streak
        </span>
      </div>
    </div>
  )
}
