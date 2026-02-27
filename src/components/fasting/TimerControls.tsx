'use client'

import { useState } from 'react'
import { Play, Square, Clock, Minus, X, Flame, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { getCurrentBodyState, getNextBodyState } from '@/lib/fasting/body-states'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TimerControlsProps {
  /** Whether a fast is currently active */
  isActive: boolean
  /** Called to start a new fast */
  onStart: () => void
  /** Called to complete the current fast */
  onComplete: () => void
  /** Called to extend the fast by 1 hour */
  onExtend: () => void
  /** Called to reduce the fast by 1 hour (undo an extension) */
  onReduce?: () => void
  /** Called to cancel the current fast */
  onCancel: () => void
  /** Number of hours added via extensions (shows -1h when > 0) */
  extendedHours?: number
  /** Elapsed fasting hours (used for body-state-aware end dialog) */
  elapsedHours?: number
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Confirmation dialog type                                           */
/* ------------------------------------------------------------------ */

type ConfirmAction = 'complete' | 'cancel' | null

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatElapsed(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.floor((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatHoursMinutes(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.floor((hours - h) * 60)
  if (h === 0) return `${m} minutes`
  if (m === 0) return `${h} hour${h !== 1 ? 's' : ''}`
  return `${h}h ${m}m`
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TimerControls({
  isActive,
  onStart,
  onComplete,
  onExtend,
  onReduce,
  onCancel,
  extendedHours = 0,
  elapsedHours,
  className,
}: TimerControlsProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  function handleConfirm() {
    if (confirmAction === 'complete') {
      onComplete()
    } else if (confirmAction === 'cancel') {
      onCancel()
    }
    setConfirmAction(null)
  }

  function handleDismiss() {
    setConfirmAction(null)
  }

  // Body-state info for the end dialog
  const currentState = elapsedHours != null ? getCurrentBodyState(elapsedHours) : null
  const nextState = elapsedHours != null ? getNextBodyState(elapsedHours) : null
  const hoursUntilNext = nextState && elapsedHours != null
    ? nextState.startHour - elapsedHours
    : null

  if (!isActive) {
    return (
      <div className={cn('flex justify-center', className)}>
        <Button
          variant="primary"
          size="lg"
          onClick={onStart}
          leftIcon={<Play size={20} />}
          className="min-w-[200px]"
        >
          Start a Fast
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className={cn('flex items-center justify-center gap-3', className)}>
        {/* End Fast */}
        <Button
          variant="primary"
          size="md"
          onClick={() => setConfirmAction('complete')}
          leftIcon={<Square size={16} />}
        >
          End Fast
        </Button>

        {/* Reduce -1h (only when extensions have been added) */}
        {extendedHours > 0 && onReduce && (
          <Button
            variant="outline"
            size="md"
            onClick={onReduce}
            leftIcon={<Minus size={16} />}
          >
            −1h
          </Button>
        )}

        {/* Extend +1h */}
        <Button
          variant="outline"
          size="md"
          onClick={onExtend}
          leftIcon={<Clock size={16} />}
        >
          +1h
        </Button>

        {/* Cancel */}
        <Button
          variant="ghost"
          size="md"
          onClick={() => setConfirmAction('cancel')}
          leftIcon={<X size={16} />}
          className="text-[var(--fl-danger)] hover:text-[var(--fl-danger)] hover:bg-red-50"
        >
          Cancel
        </Button>
      </div>

      {/* ── End Fast Dialog ─────────────────────────────── */}
      <Dialog
        open={confirmAction === 'complete'}
        onClose={handleDismiss}
      >
        <div className="flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100">
            <Flame size={32} className="text-orange-500" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-[var(--fl-text)]">
              End your fast?
            </h2>
            {elapsedHours != null && (
              <p className="mt-2 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
                You&apos;ve been fasting for{' '}
                <span className="font-semibold text-[var(--fl-text)]">
                  {formatElapsed(elapsedHours)}
                </span>
              </p>
            )}
          </div>

          {/* Body state progress card */}
          {currentState && (
            <div className="w-full rounded-xl bg-[var(--fl-bg-secondary)] p-4">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-lg">{currentState.emoji}</span>
                <span className="font-semibold text-[var(--fl-text)]">
                  {currentState.name}
                </span>
              </div>
              {nextState && hoursUntilNext != null && hoursUntilNext > 0 && (
                <p className="mt-2 text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
                  Only{' '}
                  <span className="font-bold text-[var(--fl-primary)]">
                    {formatHoursMinutes(hoursUntilNext)}
                  </span>{' '}
                  until {nextState.emoji} {nextState.name}
                </p>
              )}
            </div>
          )}

          {/* Buttons — Keep Going is primary, End Fast is secondary */}
          <div className="flex w-full flex-col gap-2.5">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleDismiss}
              leftIcon={<Flame size={18} />}
            >
              Keep Going
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={handleConfirm}
              className="text-[var(--fl-text-tertiary)] hover:text-[var(--fl-text-secondary)]"
            >
              End Fast
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ── Cancel Fast Dialog ──────────────────────────── */}
      <Dialog
        open={confirmAction === 'cancel'}
        onClose={handleDismiss}
      >
        <div className="flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={32} className="text-[var(--fl-danger)]" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-[var(--fl-text)]">
              Cancel your fast?
            </h2>
            <p className="mt-2 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
              This will discard your current session.
              {elapsedHours != null && (
                <>
                  {' '}You&apos;ll lose{' '}
                  <span className="font-semibold text-[var(--fl-text)]">
                    {formatElapsed(elapsedHours)}
                  </span>{' '}
                  of progress.
                </>
              )}
            </p>
          </div>

          {/* Warning card */}
          <div className="w-full rounded-xl bg-red-50 p-4">
            <p className="text-[var(--fl-text-xs)] font-medium text-[var(--fl-danger)]">
              This action cannot be undone. Your fasting data for this session will not be saved.
            </p>
          </div>

          {/* Buttons — Go Back is primary, Cancel is destructive */}
          <div className="flex w-full flex-col gap-2.5">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleDismiss}
            >
              Go Back
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={handleConfirm}
              className="text-[var(--fl-danger)] hover:text-[var(--fl-danger)] hover:bg-red-50"
            >
              Cancel Fast
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
