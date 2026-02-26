'use client'

import { cn } from '@/lib/utils/cn'
import {
  getCurrentBodyState,
  getNextBodyState,
} from '@/lib/fasting/body-states'

export interface BodyStateCardProps {
  /** Hours elapsed since the fast started */
  elapsedHours: number
  /** Extra class names */
  className?: string
}

function formatTimeUntil(hours: number): string {
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60))
    return `${mins}m`
  }
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function BodyStateCard({ elapsedHours, className }: BodyStateCardProps) {
  const current = getCurrentBodyState(elapsedHours)
  const next = getNextBodyState(elapsedHours)

  const timeUntilNext = next ? next.startHour - elapsedHours : null

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[var(--fl-radius-lg)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-3',
        className,
      )}
    >
      <span className="text-2xl" role="img" aria-label={current.name}>
        {current.emoji}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text)]">
          {current.name}
        </p>
        {next && timeUntilNext !== null && (
          <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
            Next: {next.emoji} {next.name} in {formatTimeUntil(timeUntilNext)}
          </p>
        )}
      </div>
    </div>
  )
}
