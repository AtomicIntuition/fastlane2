'use client'

import { useState, useCallback } from 'react'
import { Zap } from 'lucide-react'
import { useTimer } from '@/hooks/use-timer'
import { useTimerStore } from '@/stores/timer-store'
import {
  useStartFast,
  useCompleteFast,
  useCancelFast,
  useExtendFast,
  useSubmitCheckin,
  type FastingSessionData,
} from '@/hooks/use-fasting-session'
import { useApp } from '@/components/layout/AppShell'
import { TimerRing } from '@/components/fasting/TimerRing'
import { TimerControls } from '@/components/fasting/TimerControls'
import { ProtocolPicker } from '@/components/fasting/ProtocolPicker'
import { StreakBadge } from '@/components/fasting/StreakBadge'
import { CheckinForm, type CheckinInput } from '@/components/checkin/CheckinForm'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { getProtocol, type FastingProtocol } from '@/lib/fasting/protocols'
import { formatDuration } from '@/lib/utils/dates'
import type { StreakResult } from '@/lib/fasting/streaks'

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface DashboardContentProps {
  initialActiveSession: FastingSessionData | null
  streaks: StreakResult
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DashboardContent({
  initialActiveSession,
  streaks,
}: DashboardContentProps) {
  const { planId } = useApp()
  const isPro = planId === 'pro'

  /* ---- Timer state from zustand + hook ---- */
  const timer = useTimer()
  const timerStore = useTimerStore()

  /* ---- Mutations ---- */
  const startFast = useStartFast()
  const completeFast = useCompleteFast()
  const cancelFast = useCancelFast()
  const extendFast = useExtendFast()
  const submitCheckin = useSubmitCheckin()

  /* ---- Local state ---- */
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>('16-8')
  const [showCheckin, setShowCheckin] = useState(false)
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null)
  const [startError, setStartError] = useState<string | null>(null)

  /* ---- Hydrate timer store from server data on first render ---- */
  // If there is an active session from the server but the timer store is empty,
  // sync the store so the timer ring starts counting.
  if (initialActiveSession && !timerStore.isActive && initialActiveSession.status === 'active') {
    timerStore.startTimer({
      id: initialActiveSession.id,
      protocol: initialActiveSession.protocol,
      startedAt: initialActiveSession.startedAt,
      targetEndAt: initialActiveSession.targetEndAt,
      fastingHours: initialActiveSession.fastingHours,
      eatingHours: initialActiveSession.eatingHours,
    })
  }

  /* ---- Determine if a fast is active ---- */
  const isActive = timer.isActive

  /* ---- Handlers ---- */
  const handleStart = useCallback(() => {
    if (!selectedProtocol) {
      setStartError('Please select a fasting protocol first.')
      return
    }
    setStartError(null)
    startFast.mutate(selectedProtocol)
  }, [selectedProtocol, startFast])

  const handleComplete = useCallback(() => {
    if (!timer.sessionId) return
    const sid = timer.sessionId
    completeFast.mutate(sid, {
      onSuccess: () => {
        setCompletedSessionId(sid)
        setShowCheckin(true)
      },
    })
  }, [timer.sessionId, completeFast])

  const handleCancel = useCallback(() => {
    if (!timer.sessionId) return
    cancelFast.mutate(timer.sessionId)
  }, [timer.sessionId, cancelFast])

  const handleExtend = useCallback(() => {
    if (!timer.sessionId) return
    extendFast.mutate({ sessionId: timer.sessionId, additionalHours: 1 })
  }, [timer.sessionId, extendFast])

  const handleProtocolSelect = useCallback((protocol: FastingProtocol) => {
    setSelectedProtocol(protocol.id)
  }, [])

  const handleCheckinSubmit = useCallback(
    async (data: CheckinInput) => {
      await submitCheckin.mutateAsync({
        mood: data.mood,
        hungerLevel: data.hungerLevel,
        energyLevel: data.energyLevel,
        notes: data.notes || undefined,
        fastingSessionId: completedSessionId ?? undefined,
      })
      setShowCheckin(false)
      setCompletedSessionId(null)
    },
    [submitCheckin, completedSessionId],
  )

  /* ---- Render ---- */
  const protocolInfo = timer.protocol ? getProtocol(timer.protocol) : null

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* ---- Streak Badge ---- */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--fl-text)]">
          Dashboard
        </h2>
        <StreakBadge streak={streaks.currentStreak} />
      </div>

      {/* ---- Timer Section ---- */}
      {isActive ? (
        /* Active fast view */
        <Card padding="lg" className="flex flex-col items-center gap-6">
          <TimerRing
            progress={timer.progress}
            hours={timer.hours}
            minutes={timer.minutes}
            seconds={timer.seconds}
            isComplete={timer.isComplete}
            isOvertime={timer.isOvertime}
            overtimeMs={timer.overtimeMs}
            protocol={protocolInfo?.name ?? timer.protocol}
            isActive
          />

          <div className="text-center">
            <p className="text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
              {timer.isComplete
                ? 'You reached your goal! End the fast or keep going.'
                : `${formatDuration(timer.remaining)} remaining`}
            </p>
          </div>

          <TimerControls
            isActive
            onStart={handleStart}
            onComplete={handleComplete}
            onExtend={handleExtend}
            onCancel={handleCancel}
          />
        </Card>
      ) : (
        /* Ready to fast view */
        <Card padding="lg" className="flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fl-primary)]/10">
              <Zap size={28} className="text-[var(--fl-primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--fl-text)]">
              Ready to fast?
            </h3>
            <p className="mt-1 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
              Choose a protocol and start your fasting session.
            </p>
          </div>

          <ProtocolPicker
            selectedProtocol={selectedProtocol}
            onSelect={handleProtocolSelect}
            isPro={isPro}
          />

          {startError && (
            <p className="text-sm text-[var(--fl-danger)]">{startError}</p>
          )}

          <TimerControls
            isActive={false}
            onStart={handleStart}
            onComplete={handleComplete}
            onExtend={handleExtend}
            onCancel={handleCancel}
          />
        </Card>
      )}

      {/* ---- Quick Stats ---- */}
      <Card padding="md">
        <h3 className="mb-4 text-[var(--fl-text-base)] font-semibold text-[var(--fl-text)]">
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-2xl font-bold tabular-nums text-[var(--fl-text)]">
              {streaks.currentStreak}
            </span>
            <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
              Current Streak
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-2xl font-bold tabular-nums text-[var(--fl-text)]">
              {streaks.longestStreak}
            </span>
            <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
              Longest Streak
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-2xl font-bold tabular-nums text-[var(--fl-text)]">
              {streaks.totalCompleted}
            </span>
            <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
              Total Fasts
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-2xl font-bold tabular-nums text-[var(--fl-text)]">
              {streaks.completionRate}%
            </span>
            <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
              Completion Rate
            </span>
          </div>
        </div>
      </Card>

      {/* ---- Check-in Dialog ---- */}
      <Dialog
        open={showCheckin}
        onClose={() => {
          setShowCheckin(false)
          setCompletedSessionId(null)
        }}
        title="How are you feeling?"
        description="Log a quick check-in after your fast."
      >
        <CheckinForm onSubmit={handleCheckinSubmit} />
      </Dialog>
    </div>
  )
}
