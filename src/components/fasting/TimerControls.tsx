'use client'

import { useState } from 'react'
import { Play, Square, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'

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
  /** Extra class names for the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Confirmation dialog type                                           */
/* ------------------------------------------------------------------ */

type ConfirmAction = 'complete' | 'cancel' | null

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TimerControls({
  isActive,
  onStart,
  onComplete,
  onExtend,
  onCancel,
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
          confirmAction === 'complete'
            ? 'This will log your fasting session and save your progress.'
            : 'This will discard your current fasting session. This action cannot be undone.'
        }
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              Go Back
            </Button>
            <Button
              variant={confirmAction === 'cancel' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirm}
            >
              {confirmAction === 'complete' ? 'End Fast' : 'Cancel Fast'}
            </Button>
          </>
        }
      />
    </>
  )
}
