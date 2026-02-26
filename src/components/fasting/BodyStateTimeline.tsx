'use client'

import { cn } from '@/lib/utils/cn'
import {
  BODY_STATES,
  getCurrentBodyState,
  type BodyState,
} from '@/lib/fasting/body-states'

export interface BodyStateTimelineProps {
  /** Hours elapsed since the fast started */
  elapsedHours: number
  /** Total fast duration in hours (used to filter visible states) */
  fastingHours: number
  /** Extra class names */
  className?: string
}

type StateStatus = 'passed' | 'current' | 'future' | 'unreachable'

function getStatus(state: BodyState, elapsedHours: number, maxHour: number): StateStatus {
  const current = getCurrentBodyState(elapsedHours)
  if (state.id === current.id) return 'current'
  if (elapsedHours >= state.endHour) return 'passed'
  if (state.startHour > maxHour) return 'unreachable'
  return 'future'
}

function formatTimeHint(hours: number): string {
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60))
    return `in ${mins}m`
  }
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`
}

const dotStyles: Record<StateStatus, string> = {
  passed: 'bg-[var(--fl-success)] border-[var(--fl-success)]',
  current: 'bg-[var(--fl-primary)] border-[var(--fl-primary)] ring-4 ring-[var(--fl-primary)]/20',
  future: 'bg-[var(--fl-bg-tertiary)] border-[var(--fl-border)]',
  unreachable: 'bg-[var(--fl-bg-tertiary)] border-[var(--fl-border)] opacity-40',
}

const lineStyles: Record<StateStatus, string> = {
  passed: 'bg-[var(--fl-success)]',
  current: 'bg-[var(--fl-primary)]',
  future: 'bg-[var(--fl-border)]',
  unreachable: 'bg-[var(--fl-border)] opacity-40',
}

export function BodyStateTimeline({
  elapsedHours,
  fastingHours,
  className,
}: BodyStateTimelineProps) {
  // Show states relevant to this fast + 12h buffer
  const maxHour = fastingHours + 12
  const visibleStates = BODY_STATES.filter((s) => s.startHour < maxHour)

  return (
    <div className={cn('flex flex-col', className)}>
      {visibleStates.map((state, idx) => {
        const status = getStatus(state, elapsedHours, fastingHours)
        const isLast = idx === visibleStates.length - 1
        const timeUntil = state.startHour - elapsedHours

        return (
          <div key={state.id} className="flex gap-3">
            {/* Dot + Line column */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-3 w-3 shrink-0 rounded-full border-2 transition-all',
                  dotStyles[status],
                  status === 'current' && 'animate-pulse',
                )}
              />
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[24px]',
                    lineStyles[status],
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-4', isLast && 'pb-0')}>
              <div className="flex items-center gap-2">
                <span className="text-sm" role="img" aria-label={state.name}>
                  {state.emoji}
                </span>
                <span
                  className={cn(
                    'text-[var(--fl-text-sm)] font-semibold',
                    status === 'passed' && 'text-[var(--fl-success)]',
                    status === 'current' && 'text-[var(--fl-primary)]',
                    status === 'future' && 'text-[var(--fl-text-secondary)]',
                    status === 'unreachable' && 'text-[var(--fl-text-tertiary)] opacity-50',
                  )}
                >
                  {state.name}
                </span>
                <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                  {state.startHour}h – {state.endHour}h
                </span>
              </div>

              {status === 'current' && (
                <p className="mt-1 text-[var(--fl-text-xs)] leading-relaxed text-[var(--fl-text-secondary)]">
                  {state.description}
                </p>
              )}

              {status === 'future' && timeUntil > 0 && (
                <p className="mt-0.5 text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                  {formatTimeHint(timeUntil)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
