'use client'

import { Check } from 'lucide-react'
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
    return `${mins}m`
  }
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function BodyStateTimeline({
  elapsedHours,
  fastingHours,
  className,
}: BodyStateTimelineProps) {
  // Show states reachable within this protocol + the next one as a teaser
  const reachableStates = BODY_STATES.filter((s) => s.startHour < fastingHours)
  const nextStateIdx = reachableStates.length
  const visibleStates = nextStateIdx < BODY_STATES.length
    ? [...reachableStates, BODY_STATES[nextStateIdx]]
    : reachableStates
  const maxHour = fastingHours

  return (
    <div className={cn('flex flex-col', className)}>
      {visibleStates.map((state, idx) => {
        const status = getStatus(state, elapsedHours, fastingHours)
        const isLast = idx === visibleStates.length - 1
        const timeUntil = state.startHour - elapsedHours

        return (
          <div key={state.id} className="flex gap-3.5">
            {/* Indicator + Line column */}
            <div className="flex flex-col items-center">
              {/* Passed = checkmark, Current = glowing dot, Future = empty dot */}
              {status === 'passed' ? (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--fl-success)]">
                  <Check size={12} strokeWidth={3} className="text-white" />
                </div>
              ) : status === 'current' ? (
                <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[var(--fl-primary)] opacity-20" style={{ animationDuration: '2s' }} />
                  <div className="h-3.5 w-3.5 rounded-full border-[3px] border-[var(--fl-primary)] bg-[var(--fl-primary)]" />
                </div>
              ) : (
                <div
                  className={cn(
                    'h-5 w-5 shrink-0 rounded-full border-2',
                    status === 'unreachable'
                      ? 'border-[var(--fl-border)] opacity-30'
                      : 'border-[var(--fl-border)] bg-[var(--fl-bg)]',
                  )}
                />
              )}

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1',
                    status === 'passed' ? 'bg-[var(--fl-success)]' : 'bg-[var(--fl-border)]',
                    status === 'unreachable' && 'opacity-30',
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-5', isLast && 'pb-0', status === 'current' && 'pb-6')}>
              {/* State header row */}
              <div className="flex items-baseline gap-2">
                <span className="text-sm leading-none" role="img" aria-label={state.name}>
                  {state.emoji}
                </span>
                <span
                  className={cn(
                    'text-[var(--fl-text-sm)] font-semibold leading-tight',
                    status === 'passed' && 'text-[var(--fl-success)]',
                    status === 'current' && 'text-[var(--fl-text)]',
                    status === 'future' && 'text-[var(--fl-text-secondary)]',
                    status === 'unreachable' && 'text-[var(--fl-text-tertiary)] opacity-40',
                  )}
                >
                  {state.name}
                </span>
                <span
                  className={cn(
                    'text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]',
                    status === 'unreachable' && 'opacity-40',
                  )}
                >
                  {state.startHour}–{state.endHour}h
                </span>
              </div>

              {/* Current state — expanded description */}
              {status === 'current' && (
                <p className="mt-1.5 text-[var(--fl-text-xs)] leading-relaxed text-[var(--fl-text-secondary)]">
                  {state.description}
                </p>
              )}

              {/* Future state — time hint */}
              {status === 'future' && timeUntil > 0 && (
                <p className="mt-1 text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                  in {formatTimeHint(timeUntil)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
