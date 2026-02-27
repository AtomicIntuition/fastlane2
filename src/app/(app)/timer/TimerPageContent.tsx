'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Droplet, ChevronDown, UtensilsCrossed, Moon, GlassWater, Sun } from 'lucide-react'
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
import { generateId } from '@/lib/utils/id'

interface TimerPageContentProps {
  initialActiveSession: FastingSessionData | null
}

export function TimerPageContent({ initialActiveSession }: TimerPageContentProps) {
  const { user, planId } = useApp()
  const isPro = planId === 'pro'
  const isGuest = !user
  const router = useRouter()

  const timer = useTimer()
  const timerStore = useTimerStore()

  // API hooks — only used for logged-in users
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
  const [showLearnMore, setShowLearnMore] = useState(false)

  // Hydrate timer store from server data (logged-in users only)
  if (initialActiveSession && !timerStore.isActive && initialActiveSession.status === 'active') {
    timerStore.startTimer({
      id: initialActiveSession.id,
      protocol: initialActiveSession.protocol,
      startedAt: initialActiveSession.startedAt,
      targetEndAt: initialActiveSession.targetEndAt,
      fastingHours: initialActiveSession.fastingHours,
      eatingHours: initialActiveSession.eatingHours,
    })
    const serverWater = initialActiveSession.waterGlasses ?? 0
    if (serverWater > 0) {
      for (let i = 0; i < serverWater; i++) timerStore.addWater()
    }
  }

  const isActive = timer.isActive

  /* ---------------------------------------------------------------- */
  /*  Handlers — guest uses local store, auth users use API            */
  /* ---------------------------------------------------------------- */

  const handleStart = useCallback(() => {
    if (!selectedProtocol) return

    if (isGuest) {
      const protocol = getProtocol(selectedProtocol)
      if (!protocol) return
      const now = Date.now()
      timerStore.startTimer({
        id: generateId(),
        protocol: protocol.id,
        startedAt: now,
        targetEndAt: now + protocol.fastingHours * 60 * 60 * 1000,
        fastingHours: protocol.fastingHours,
        eatingHours: protocol.eatingHours,
      })
    } else {
      startFast.mutate(selectedProtocol)
    }
  }, [selectedProtocol, isGuest, timerStore, startFast])

  const handleComplete = useCallback(() => {
    if (isGuest) {
      timerStore.clear()
      return
    }
    if (!timer.sessionId) return
    const sid = timer.sessionId
    completeFast.mutate(sid, {
      onSuccess: () => {
        setCompletedSessionId(sid)
        setShowCheckin(true)
      },
    })
  }, [isGuest, timer.sessionId, timerStore, completeFast])

  const handleCancel = useCallback(() => {
    if (isGuest) {
      timerStore.clear()
      return
    }
    if (!timer.sessionId) return
    cancelFast.mutate(timer.sessionId)
  }, [isGuest, timer.sessionId, timerStore, cancelFast])

  const handleExtend = useCallback(() => {
    if (isGuest) {
      if (!timerStore.targetEndAt || !timerStore.fastingHours) return
      timerStore.updateTarget(
        timerStore.targetEndAt + 3_600_000,
        timerStore.fastingHours + 1,
      )
      return
    }
    if (!timer.sessionId) return
    extendFast.mutate({ sessionId: timer.sessionId, additionalHours: 1 })
  }, [isGuest, timerStore, timer.sessionId, extendFast])

  const handleAddWater = useCallback(() => {
    if (isGuest) {
      timerStore.addWater()
      return
    }
    if (timer.sessionId) addWater.mutate(timer.sessionId)
  }, [isGuest, timerStore, timer.sessionId, addWater])

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
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleAddWater}
              className="flex items-center gap-2 rounded-[var(--fl-radius-lg)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-2 text-[var(--fl-text-sm)] font-medium text-[var(--fl-info)] transition-colors hover:bg-blue-50"
            >
              <Droplet size={18} />
              <span>Log Water</span>
              {timerStore.waterGlasses > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--fl-info)] px-1.5 text-[var(--fl-text-xs)] font-bold text-white">
                  {timerStore.waterGlasses}
                </span>
              )}
            </button>
            <p className="text-[10px] text-[var(--fl-text-tertiary)]">
              Water, black coffee & tea won&apos;t break your fast
            </p>
          </div>

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

          {/* Sign-up nudge for guests */}
          {isGuest && (
            <p className="text-center text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
              <a href="/register" className="underline hover:text-[var(--fl-text-secondary)]">
                Create an account
              </a>{' '}
              to save your progress
            </p>
          )}
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

          {/* How It Works */}
          <div className="w-full rounded-2xl bg-[var(--fl-bg-secondary)] p-5">
            <h3 className="mb-4 text-center text-sm font-semibold text-[var(--fl-text)]">
              How It Works
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: UtensilsCrossed, step: '1', text: 'Finish your last meal', color: 'text-orange-500' },
                { icon: Moon, step: '2', text: 'Tap Start — sleep through most of it', color: 'text-violet-500' },
                { icon: GlassWater, step: '3', text: 'Stay hydrated — water, coffee & tea are OK', color: 'text-blue-500' },
                { icon: Sun, step: '4', text: 'Timer ends — enjoy your eating window!', color: 'text-amber-500' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col items-center gap-2 rounded-xl bg-[var(--fl-bg)] p-3 text-center"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fl-bg-secondary)]">
                    <item.icon size={18} className={item.color} />
                  </div>
                  <p className="text-[11px] font-medium leading-snug text-[var(--fl-text-secondary)]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pulsing START FAST button */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow halo */}
            <span className="start-btn-glow absolute -inset-5 rounded-full bg-gradient-to-br from-blue-500/40 via-violet-500/40 to-amber-500/40 blur-xl" />
            <button
              type="button"
              onClick={handleStart}
              className="start-btn-breathe relative flex h-[180px] w-[180px] items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-amber-500 text-white shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] active:scale-95"
            >
              <span className="relative text-xl font-bold uppercase tracking-widest">
                Start<br />Fast
              </span>
            </button>
          </div>

          <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
            Tap to start a {selectedProtocolInfo?.fastingHours ?? 16}h fast
          </p>

          {/* Benefit pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { emoji: '🔥', label: 'Fat Burning' },
              { emoji: '🧠', label: 'Mental Clarity' },
              { emoji: '♻️', label: 'Cell Repair' },
              { emoji: '🌱', label: 'Longevity' },
            ].map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--fl-bg-secondary)] px-3 py-1.5 text-[var(--fl-text-xs)] font-medium text-[var(--fl-text-secondary)]"
              >
                <span>{b.emoji}</span>
                {b.label}
              </span>
            ))}
          </div>

          {/* Expandable learn more */}
          <div className="w-full">
            <button
              type="button"
              onClick={() => setShowLearnMore(!showLearnMore)}
              className="flex w-full items-center justify-center gap-1.5 py-2 text-[var(--fl-text-xs)] font-medium text-[var(--fl-primary)] transition-colors hover:text-[var(--fl-primary-hover)]"
            >
              What is intermittent fasting?
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showLearnMore ? 'rotate-180' : ''}`}
              />
            </button>

            {showLearnMore && (
              <div className="mt-1 rounded-xl bg-[var(--fl-bg-secondary)] p-4 text-[var(--fl-text-sm)] leading-relaxed text-[var(--fl-text-secondary)]">
                <p>
                  Intermittent fasting (IF) is an eating pattern that cycles between periods of
                  fasting and eating. Rather than restricting <em>what</em> you eat, it focuses
                  on <em>when</em> you eat.
                </p>
                <p className="mt-3">
                  During fasting windows, your body shifts from burning glucose to burning stored
                  fat, producing ketones that fuel your brain and trigger cellular cleanup
                  (autophagy). Most people start with a 16:8 schedule — 16 hours fasting, 8
                  hours eating.
                </p>
                <p className="mt-3 text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                  Consult your doctor before starting any fasting regimen, especially if you have
                  a medical condition or are pregnant.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Check-in dialog (logged-in users only) */}
      {!isGuest && (
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
      )}
    </div>
  )
}
