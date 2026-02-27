'use client'

import { cn } from '@/lib/utils/cn'
import {
  getCurrentBodyState,
  getNextBodyState,
} from '@/lib/fasting/body-states'

export interface BodyStateCardProps {
  /** Hours elapsed since the fast started */
  elapsedHours: number
  /** Total fasting hours for the protocol (used to limit next-state display) */
  fastingHours?: number
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

export function BodyStateCard({ elapsedHours, fastingHours, className }: BodyStateCardProps) {
  const current = getCurrentBodyState(elapsedHours)
  const rawNext = getNextBodyState(elapsedHours)

  // Only show next state if it's reachable within the protocol window
  const next = rawNext && fastingHours != null && rawNext.startHour > fastingHours ? null : rawNext
  const timeUntilNext = next ? next.startHour - elapsedHours : null

  return (
    <div
      className={cn(
        'rounded-[var(--fl-radius-lg)] border border-[var(--fl-border)] bg-[var(--fl-bg)] p-4',
        className,
      )}
    >
      <div className="flex gap-3">
        {/* Emoji — top-left */}
        <span className="mt-0.5 text-2xl leading-none" role="img" aria-label={current.name}>
          {current.emoji}
        </span>

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <p className="text-[var(--fl-text-sm)] font-bold text-[var(--fl-text)]">
            {current.name}
          </p>
          <p className="mt-1 text-[var(--fl-text-xs)] leading-relaxed text-[var(--fl-text-secondary)]">
            {current.description}
          </p>

          {/* Next state transition */}
          {next && timeUntilNext !== null && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[var(--fl-bg-secondary)] px-2.5 py-1">
              <span className="text-xs">{next.emoji}</span>
              <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
                <span className="font-semibold text-[var(--fl-primary)]">{next.name}</span>
                {' '}in {formatTimeUntil(timeUntilNext)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
