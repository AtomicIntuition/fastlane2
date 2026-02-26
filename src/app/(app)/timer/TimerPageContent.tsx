'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Droplet } from 'lucide-react'
import { useTimer } from '@/hooks/use-timer'
import { useTimerStore } from '@/stores/timer-store'
import {
  useStartFast,
  useCompleteFast,
  useCancelFast,
  useExtendFast,
  useAddWater,
  useSubmitCheckin,
  type FastingSessionData,
} from '@/hooks/use-fasting-session'
import { useApp } from '@/components/layout/AppShell'
import { TimerRing } from '@/components/fasting/TimerRing'
import { TimerControls } from '@/components/fasting/TimerControls'
import { ProtocolPicker } from '@/components/fasting/ProtocolPicker'
import { BodyStateCard } from '@/components/fasting/BodyStateCard'
import { BodyStateTimeline } from '@/components/fasting/BodyStateTimeline'
import { CheckinForm, type CheckinInput } from '@/components/checkin/CheckinForm'
import { Dialog } from '@/components/ui/Dialog'
import { getProtocol, type FastingProtocol } from '@/lib/fasting/protocols'
import { formatDuration } from '@/lib/utils/dates'

interface TimerPageContentProps {
  initialActiveSession: FastingSessionData | null
}

export function TimerPageContent({ initialActiveSession }: TimerPageContentProps) {
  const { planId } = useApp()
  const isPro = planId === 'pro'
  const router = useRouter()

  const timer = useTimer()
  const timerStore = useTimerStore()

  const startFast = useStartFast()
  const completeFast = useCompleteFast()
  const cancelFast = useCancelFast()
  const extendFast = useExtendFast()
  const addWater = useAddWater()
  const submitCheckin = useSubmitCheckin()

  const [selectedProtocol, setSelectedProtocol] = useState<string | null>('16-8')
  const [showCheckin, setShowCheckin] = useState(false)
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null)
  const [showProtocols, setShowProtocols] = useState(false)

  // Hydrate timer store from server data
  if (initialActiveSession && !timerStore.isActive && initialActiveSession.status === 'active') {
    timerStore.startTimer({
      id: initialActiveSession.id,
      protocol: initialActiveSession.protocol,
      startedAt: initialActiveSession.startedAt,
      targetEndAt: initialActiveSession.targetEndAt,
      fastingHours: initialActiveSession.fastingHours,
      eatingHours: initialActiveSession.eatingHours,
    })
    // Restore water count from DB
    const serverWater = initialActiveSession.waterGlasses ?? 0
    if (serverWater > 0) {
      for (let i = 0; i < serverWater; i++) timerStore.addWater()
    }
  }

  const isActive = timer.isActive

  const handleStart = useCallback(() => {
    if (!selectedProtocol) return
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
    setShowProtocols(false)
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
      router.push('/timer')
    },
    [submitCheckin, completedSessionId, router],
  )

  const protocolInfo = timer.protocol ? getProtocol(timer.protocol) : null
  const selectedProtocolInfo = selectedProtocol ? getProtocol(selectedProtocol) : null
  const elapsedHours = timer.elapsed / 3_600_000

  return (
    <div className="mx-auto max-w-lg">
      {isActive ? (
        <div className="flex flex-col items-center gap-4">
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

          <BodyStateCard elapsedHours={elapsedHours} className="w-full" />

          {/* Water tracking */}
          <button
            type="button"
            onClick={() => timer.sessionId && addWater.mutate(timer.sessionId)}
            className="flex items-center gap-2 rounded-[var(--fl-radius-lg)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-2 text-[var(--fl-text-sm)] font-medium text-[var(--fl-info)] transition-colors hover:bg-blue-50"
          >
            <Droplet size={18} />
            <span>Water</span>
            {timerStore.waterGlasses > 0 && (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--fl-info)] px-1.5 text-[var(--fl-text-xs)] font-bold text-white">
                {timerStore.waterGlasses}
              </span>
            )}
          </button>

          <p className="text-sm text-[var(--fl-text-secondary)] text-center">
            {timer.isComplete
              ? 'You reached your goal! End the fast or keep going.'
              : `${formatDuration(timer.remaining)} remaining`}
          </p>

          <TimerControls
            isActive
            onStart={handleStart}
            onComplete={handleComplete}
            onExtend={handleExtend}
            onCancel={handleCancel}
            elapsedHours={elapsedHours}
          />

          <div className="w-full">
            <h3 className="mb-3 text-sm font-semibold text-[var(--fl-text)]">Body State Timeline</h3>
            <BodyStateTimeline
              elapsedHours={elapsedHours}
              fastingHours={timerStore.fastingHours ?? 16}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-8 pt-8">
          {/* App icon */}
          <div className="text-center">
            <Image
              src="/icon.png"
              alt="FastLane"
              width={64}
              height={64}
              className="mx-auto rounded-2xl"
            />
          </div>

          {/* Selected protocol chip */}
          {selectedProtocolInfo && !showProtocols && (
            <button
              type="button"
              onClick={() => setShowProtocols(true)}
              className="flex items-center gap-2 rounded-[var(--fl-radius-lg)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-2.5 transition-colors hover:border-[var(--fl-border-hover)]"
            >
              <span className="text-[var(--fl-text-sm)] font-bold text-[var(--fl-primary)]">
                {selectedProtocolInfo.name}
              </span>
              <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                {selectedProtocolInfo.fastingHours}h fast / {selectedProtocolInfo.eatingHours}h eat
              </span>
              <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                Change
              </span>
            </button>
          )}

          {/* Protocol picker (toggleable) */}
          {showProtocols && (
            <div className="w-full">
              <ProtocolPicker
                selectedProtocol={selectedProtocol}
                onSelect={handleProtocolSelect}
                isPro={isPro}
              />
            </div>
          )}

          {/* Pulsing START FAST button */}
          <button
            type="button"
            onClick={handleStart}
            className="group relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-amber-500 text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-2xl hover:shadow-violet-500/30 active:scale-95"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-amber-500 opacity-20" style={{ animationDuration: '2s' }} />
            <span className="absolute -inset-2 animate-pulse rounded-full border-2 border-violet-400/30" style={{ animationDuration: '2s' }} />
            <span className="relative text-lg font-bold uppercase tracking-wider">
              Start<br />Fast
            </span>
          </button>

          <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
            Tap to start a {selectedProtocolInfo?.fastingHours ?? 16}h fast
          </p>
        </div>
      )}

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
