'use client'

import { cn } from '@/lib/utils/cn'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TimerRingProps {
  /** Progress value from 0 to 1 */
  progress: number
  /** Remaining hours */
  hours: number
  /** Remaining minutes */
  minutes: number
  /** Remaining seconds */
  seconds: number
  /** Whether the fast has reached its target */
  isComplete: boolean
  /** Whether the user is fasting beyond the target */
  isOvertime: boolean
  /** Milliseconds past the target (overtime) */
  overtimeMs: number
  /** Protocol display name */
  protocol: string | null
  /** Whether the timer is actively running */
  isActive?: boolean
  /** Called when the user taps "End Fast" inside the ring */
  onEndFast?: () => void
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SIZE = 280
const STROKE_WIDTH = 10
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const CENTER = SIZE / 2

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatOvertime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `+${pad(h)}:${pad(m)}:${pad(s)}`
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TimerRing({
  progress,
  hours,
  minutes,
  seconds,
  isComplete,
  isOvertime,
  overtimeMs,
  protocol,
  isActive = false,
  onEndFast,
  className,
}: TimerRingProps) {
  const clampedProgress = Math.min(Math.max(0, progress), 1)
  const dashOffset = CIRCUMFERENCE * (1 - clampedProgress)

  // Determine ring color — gradient when active (not complete), solid green when complete
  const useGradient = isActive && !isComplete
  const ringColor = isComplete
    ? 'var(--fl-success, #22c55e)'
    : useGradient
      ? 'url(#timer-gradient)'
      : 'var(--fl-primary, #22c55e)'

  // Status text
  const statusText = !isActive
    ? 'Ready'
    : isComplete
      ? 'Complete!'
      : 'Fasting'

  // Time display
  const timeDisplay = isOvertime
    ? formatOvertime(overtimeMs)
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  return (
    <div
      className={cn(
        'relative inline-flex flex-col items-center justify-center',
        className,
      )}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="drop-shadow-sm"
      >
        {/* Gradient definition for active ring */}
        <defs>
          <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--fl-timer-start, #3b82f6)" />
            <stop offset="50%" stopColor="var(--fl-timer-mid, #8b5cf6)" />
            <stop offset="100%" stopColor="var(--fl-timer-end, #f59e0b)" />
          </linearGradient>
        </defs>

        {/* Background track circle */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--fl-bg-tertiary, #e5e7eb)"
          strokeWidth={STROKE_WIDTH}
          className="opacity-60"
        />

        {/* Progress arc */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={ringColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          className={cn(
            'transition-[stroke-dashoffset] duration-1000 ease-linear',
            isComplete && 'animate-pulse',
          )}
          style={{
            filter: isComplete
              ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))'
              : useGradient
                ? 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.35))'
                : undefined,
          }}
        />

        {/* Completion glow ring (visible only when complete) */}
        {isComplete && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="var(--fl-success, #22c55e)"
            strokeWidth={2}
            opacity={0.3}
            className="animate-ping"
            style={{ transformOrigin: 'center', animationDuration: '2s' }}
          />
        )}
      </svg>

      {/* Center content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Countdown / Overtime display */}
        <span
          className={cn(
            'font-mono text-4xl font-bold tabular-nums tracking-tight',
            isComplete
              ? 'text-[var(--fl-success)]'
              : 'text-[var(--fl-text)]',
          )}
        >
          {isActive ? timeDisplay : '--:--:--'}
        </span>

        {/* Protocol name */}
        {protocol && (
          <span className="mt-1 text-[var(--fl-text-sm)] font-medium text-[var(--fl-text-secondary)]">
            {protocol}
          </span>
        )}

        {/* Status text */}
        <span
          className={cn(
            'mt-0.5 text-[var(--fl-text-xs)] font-semibold uppercase tracking-wider',
            isComplete
              ? 'text-[var(--fl-success)]'
              : isActive
                ? 'text-[var(--fl-primary)]'
                : 'text-[var(--fl-text-tertiary)]',
          )}
        >
          {statusText}
        </span>

        {/* End Fast button inside ring */}
        {isActive && onEndFast && (
          <button
            type="button"
            onClick={onEndFast}
            className="mt-2.5 rounded-full bg-[var(--fl-text)]/8 px-4 py-1 text-[var(--fl-text-xs)] font-medium text-[var(--fl-text-secondary)] transition-all hover:bg-[var(--fl-text)]/15 active:scale-[0.96]"
          >
            End Fast
          </button>
        )}
      </div>
    </div>
  )
}
