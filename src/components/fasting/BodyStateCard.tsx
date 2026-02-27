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
      {/* Current state — centered hero */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-4xl" role="img" aria-label={current.name}>
          {current.emoji}
        </span>
        <p className="text-base font-bold text-[var(--fl-text)]">
          {current.name}
        </p>
        <p className="text-center text-[var(--fl-text-xs)] leading-relaxed text-[var(--fl-text-secondary)]">
          {current.description}
        </p>
      </div>

      {/* Next state transition */}
      {next && timeUntilNext !== null && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-[var(--fl-radius-md)] bg-[var(--fl-bg-secondary)] px-3 py-2">
          <span className="text-sm">{next.emoji}</span>
          <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
            <span className="font-bold text-[var(--fl-primary)]">{next.name}</span>
            {' '}in {formatTimeUntil(timeUntilNext)}
          </p>
        </div>
      )}
    </div>
  )
}
