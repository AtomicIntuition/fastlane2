'use client'

import { Flame, Trophy, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/Card'
import type { StreakResult } from '@/lib/fasting/streaks'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StreakCounterProps {
  /** Streak data from calculateStreaks() */
  streaks: StreakResult
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Stat item config                                                   */
/* ------------------------------------------------------------------ */

interface StatItem {
  label: string
  icon: typeof Flame
  iconColor: string
  getValue: (s: StreakResult) => string
}

const STATS: StatItem[] = [
  {
    label: 'Current Streak',
    icon: Flame,
    iconColor: 'text-orange-500',
    getValue: (s) => `${s.currentStreak} day${s.currentStreak !== 1 ? 's' : ''}`,
  },
  {
    label: 'Longest Streak',
    icon: Trophy,
    iconColor: 'text-amber-500',
    getValue: (s) => `${s.longestStreak} day${s.longestStreak !== 1 ? 's' : ''}`,
  },
  {
    label: 'Total Completed',
    icon: Target,
    iconColor: 'text-[var(--fl-primary)]',
    getValue: (s) => `${s.totalCompleted} fast${s.totalCompleted !== 1 ? 's' : ''}`,
  },
  {
    label: 'Completion Rate',
    icon: TrendingUp,
    iconColor: 'text-blue-500',
    getValue: (s) => `${s.completionRate}%`,
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StreakCounter({ streaks, className }: StreakCounterProps) {
  return (
    <Card padding="md" className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const isCurrent = stat.label === 'Current Streak'

          return (
            <div key={stat.label} className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--fl-radius-md)]',
                  'bg-[var(--fl-bg-secondary)]',
                )}
              >
                <stat.icon
                  size={20}
                  className={cn(
                    stat.iconColor,
                    isCurrent && streaks.currentStreak > 0 && 'fill-orange-400',
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    'font-bold tabular-nums',
                    isCurrent ? 'text-xl text-[var(--fl-text)]' : 'text-lg text-[var(--fl-text)]',
                  )}
                >
                  {stat.getValue(streaks)}
                </span>
                <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
                  {stat.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Motivational message */}
      {streaks.currentStreak > 0 && (
        <div className="mt-4 rounded-[var(--fl-radius-md)] bg-[var(--fl-primary)]/5 px-3 py-2 text-center">
          <p className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-primary)]">
            {streaks.currentStreak >= 30
              ? 'Incredible! A whole month of consistency!'
              : streaks.currentStreak >= 14
                ? 'Two weeks strong! You are building a real habit!'
                : streaks.currentStreak >= 7
                  ? 'One week down! Keep the momentum going!'
                  : streaks.currentStreak >= 3
                    ? 'Great start! Three days in a row!'
                    : 'Keep going! Every day counts.'}
          </p>
        </div>
      )}
    </Card>
  )
}
