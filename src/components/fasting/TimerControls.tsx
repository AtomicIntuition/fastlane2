'use client'

import { useState } from 'react'
import { Play, Square, Clock, X } from 'lucide-react'
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
  /** Called to cancel the current fast */
  onCancel: () => void
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
  onCancel,
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

      {/* Confirmation dialog */}
      <Dialog
        open={confirmAction !== null}
        onClose={handleDismiss}
        title={
          confirmAction === 'complete'
            ? 'End your fast?'
            : 'Cancel your fast?'
        }
        description={
          confirmAction === 'cancel'
            ? 'This will discard your current fasting session. This action cannot be undone.'
            : undefined
        }
        footer={
          confirmAction === 'complete' ? (
            <>
              <Button variant="primary" size="sm" onClick={handleDismiss}>
                Keep Going
              </Button>
              <Button variant="outline" size="sm" onClick={handleConfirm}>
                End Fast
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Go Back
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirm}>
                Cancel Fast
              </Button>
            </>
          )
        }
      >
        {confirmAction === 'complete' && elapsedHours != null && (
          <div className="flex flex-col gap-2 text-sm text-[var(--fl-text-secondary)]">
            <p>
              You&apos;ve been fasting for{' '}
              <span className="font-semibold text-[var(--fl-text)]">
                {formatElapsed(elapsedHours)}
              </span>
              .
            </p>
            {nextState && hoursUntilNext != null && hoursUntilNext > 0 && (
              <p>
                You&apos;re{' '}
                <span className="font-semibold text-[var(--fl-primary)]">
                  {formatHoursMinutes(hoursUntilNext)}
                </span>{' '}
                from {nextState.emoji} {nextState.name}!
              </p>
            )}
          </div>
        )}
      </Dialog>
    </>
  )
}
