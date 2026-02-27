'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Droplet, ChevronDown, UtensilsCrossed, Moon, GlassWater, Sun, Lightbulb, Clock, Flame, AlertTriangle } from 'lucide-react'
import { useTimer } from '@/hooks/use-timer'
import { useTimerStore } from '@/stores/timer-store'
import {
  useStartFast,
  useCompleteFast,
  useCancelFast,
  useExtendFast,
  useAddWater,
  useRemoveWater,
  useSubmitCheckin,
  type FastingSessionData,
} from '@/hooks/use-fasting-session'
import { useApp } from '@/components/layout/AppShell'
import { TimerRing } from '@/components/fasting/TimerRing'
import { TimerControls } from '@/components/fasting/TimerControls'
import { ProtocolPicker } from '@/components/fasting/ProtocolPicker'
import { BodyStateTimeline } from '@/components/fasting/BodyStateTimeline'
import { CheckinForm, type CheckinInput } from '@/components/checkin/CheckinForm'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { getCurrentBodyState, getNextBodyState } from '@/lib/fasting/body-states'
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
  const removeWater = useRemoveWater()
  const submitCheckin = useSubmitCheckin()

  const [selectedProtocol, setSelectedProtocol] = useState<string | null>('16-8')
  const [showCheckin, setShowCheckin] = useState(false)
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null)
  const [showProtocols, setShowProtocols] = useState(false)
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [activeBenefit, setActiveBenefit] = useState<string | null>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      startFast.mutate(selectedProtocol, {
        onSuccess: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      })
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
      timerStore.addExtendedHour()
      return
    }
    if (!timer.sessionId) return
    extendFast.mutate({ sessionId: timer.sessionId, additionalHours: 1 })
  }, [isGuest, timerStore, timer.sessionId, extendFast])

  const handleReduce = useCallback(() => {
    if (timerStore.extendedHours <= 0) return
    if (isGuest) {
      if (!timerStore.targetEndAt || !timerStore.fastingHours) return
      timerStore.updateTarget(
        timerStore.targetEndAt - 3_600_000,
        timerStore.fastingHours - 1,
      )
      timerStore.removeExtendedHour()
      return
    }
    if (!timer.sessionId) return
    extendFast.mutate({ sessionId: timer.sessionId, additionalHours: -1 })
  }, [isGuest, timerStore, timer.sessionId, extendFast])

  const handleAddWater = useCallback(() => {
    if (isGuest) {
      timerStore.addWater()
      return
    }
    if (timer.sessionId) addWater.mutate(timer.sessionId)
  }, [isGuest, timerStore, timer.sessionId, addWater])

  const handleRemoveWater = useCallback(() => {
    if (timerStore.waterGlasses <= 0) return
    if (isGuest) {
      timerStore.removeWater()
      return
    }
    if (timer.sessionId) removeWater.mutate(timer.sessionId)
  }, [isGuest, timerStore, timer.sessionId, removeWater])

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

  // Body state info for end fast dialog
  const currentBodyState = getCurrentBodyState(elapsedHours)
  const nextBodyState = getNextBodyState(elapsedHours)
  const hoursUntilNext = nextBodyState ? nextBodyState.startHour - elapsedHours : null

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

  return (
    <div className="mx-auto max-w-lg">
      {isActive ? (
        <div className="flex flex-col items-center gap-4">
          {/* Timer Ring with End Fast inside */}
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
            onEndFast={() => setShowEndConfirm(true)}
          />

          {/* Status */}
          <p className="text-base font-semibold text-[var(--fl-text)] text-center">
            {timer.isComplete
              ? 'You crushed it! Tap End Fast or keep going.'
              : `${formatDuration(timer.remaining)} remaining`}
          </p>

          {/* Quick Actions — single row */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleAddWater}
                className="flex items-center gap-1.5 rounded-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-1.5 text-[var(--fl-text-xs)] font-medium text-[var(--fl-info)] transition-all hover:bg-blue-50 active:scale-[0.96]"
              >
                <Droplet size={16} />
                <span>+Water</span>
                {timerStore.waterGlasses > 0 && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--fl-info)] px-1 text-[10px] font-bold text-white">
                    {timerStore.waterGlasses}
                  </span>
                )}
              </button>

              {timerStore.waterGlasses > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveWater}
                  className="rounded-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-2.5 py-1.5 text-[var(--fl-text-xs)] font-medium text-[var(--fl-text-tertiary)] transition-all hover:border-[var(--fl-border-hover)] active:scale-[0.96]"
                >
                  −Water
                </button>
              )}

              <button
                type="button"
                onClick={handleExtend}
                className="flex items-center gap-1 rounded-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-3.5 py-1.5 text-[var(--fl-text-xs)] font-medium text-[var(--fl-text-secondary)] transition-all hover:border-[var(--fl-border-hover)] active:scale-[0.96]"
              >
                <Clock size={14} />
                <span>+1h</span>
              </button>

              {timerStore.extendedHours > 0 && (
                <button
                  type="button"
                  onClick={handleReduce}
                  className="rounded-full border border-[var(--fl-border)] bg-[var(--fl-bg)] px-2.5 py-1.5 text-[var(--fl-text-xs)] font-medium text-[var(--fl-text-tertiary)] transition-all hover:border-[var(--fl-border-hover)] active:scale-[0.96]"
                >
                  −1h
                </button>
              )}
            </div>

            <p className="text-[10px] text-[var(--fl-text-tertiary)]">
              Water, black coffee &amp; tea won&apos;t break your fast
            </p>
          </div>

          {/* Body State Timeline */}
          <div className="w-full">
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

          {/* End Fast confirmation dialog */}
          <Dialog
            open={showEndConfirm}
            onClose={() => setShowEndConfirm(false)}
          >
            <div className="flex flex-col items-center text-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100">
                <Flame size={32} className="text-orange-500" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[var(--fl-text)]">
                  End your fast?
                </h2>
                <p className="mt-2 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
                  You&apos;ve been fasting for{' '}
                  <span className="font-semibold text-[var(--fl-text)]">
                    {formatElapsed(elapsedHours)}
                  </span>
                </p>
              </div>

              {currentBodyState && (
                <div className="w-full rounded-xl bg-[var(--fl-bg-secondary)] p-4">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-lg">{currentBodyState.emoji}</span>
                    <span className="font-semibold text-[var(--fl-text)]">
                      {currentBodyState.name}
                    </span>
                  </div>
                  {nextBodyState && hoursUntilNext != null && hoursUntilNext > 0 && (
                    <p className="mt-2 text-[var(--fl-text-xs)] text-[var(--fl-text-secondary)]">
                      Only{' '}
                      <span className="font-bold text-[var(--fl-primary)]">
                        {formatHoursMinutes(hoursUntilNext)}
                      </span>{' '}
                      until {nextBodyState.emoji} {nextBodyState.name}
                    </p>
                  )}
                </div>
              )}

              <div className="flex w-full flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowEndConfirm(false)}
                  leftIcon={<Flame size={18} />}
                >
                  Keep Going
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    setShowEndConfirm(false)
                    handleComplete()
                  }}
                  className="text-[var(--fl-text-tertiary)] hover:text-[var(--fl-text-secondary)]"
                >
                  End Fast
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEndConfirm(false)
                    handleCancel()
                  }}
                  className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)] transition-colors hover:text-[var(--fl-danger)]"
                >
                  Cancel fast (discard)
                </button>
              </div>
            </div>
          </Dialog>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 pt-6">
          {/* Title */}
          <h1 className="text-center font-[family-name:var(--font-playfair)] text-[2rem] font-black italic leading-tight tracking-tight text-[var(--fl-text)]">
            Intermittent Fasting
          </h1>

          {/* Protocol selection */}
          <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
            Choose your fasting schedule
          </p>
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
              <ChevronDown size={14} className="text-[var(--fl-text-tertiary)]" />
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

          {/* START FAST button — app icon as the button */}
          <div className="relative flex items-center justify-center">
            {/* Soft glow halo */}
            <span className="start-btn-glow absolute -inset-6 rounded-full bg-violet-400/20 blur-2xl" />
            <button
              type="button"
              onClick={handleStart}
              className="start-btn-breathe relative flex h-[200px] w-[200px] items-center justify-center rounded-full transition-all duration-200 active:scale-[0.96]"
            >
              <Image
                src="/icon.png"
                alt="Start Fast"
                width={200}
                height={200}
                className="absolute inset-0 h-full w-full rounded-full object-cover drop-shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
                priority
              />
              <span className="relative text-xl font-bold uppercase tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                Start<br />Fast
              </span>
            </button>
          </div>

          <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
            Tap to start a {selectedProtocolInfo?.fastingHours ?? 16}h fast
          </p>
        </div>
      )}

      {/* ── Educational content (always visible) ──────────── */}
      <div className="mt-6 flex flex-col items-center gap-6">
        {/* Benefit pills */}
        <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
          Tap to learn about the benefits
        </p>
          {(() => {
            const benefits = [
              {
                id: 'fat-burning',
                icon: '/icon-fat-burning.png',
                label: 'Fat Burning',
                title: 'Fat Burning',
                content: 'After 8–12 hours of fasting, your body runs out of glucose from your last meal and switches to burning stored fat for energy. This process, called fat oxidation, is one of the main reasons people fast. Your insulin drops low enough for fat cells to release their stores, and your body becomes a fat-burning machine. This is also when you start producing ketones — an efficient fuel source your brain loves.',
              },
              {
                id: 'mental-clarity',
                icon: '/icon-mental-clarity.png',
                label: 'Mental Clarity',
                title: 'Mental Clarity',
                content: 'Many fasters report sharper focus and clearer thinking around the 12–16 hour mark. This happens because your brain switches from glucose to ketones for fuel — and ketones are a remarkably clean energy source for your brain. Your body also increases production of BDNF (brain-derived neurotrophic factor), a protein that supports learning, memory, and the growth of new brain cells. It\'s why some of your best thinking happens on an empty stomach.',
              },
              {
                id: 'cell-repair',
                icon: '/icon-cell-repair.png',
                label: 'Cell Repair',
                title: 'Cell Repair (Autophagy)',
                content: 'Around 14–16 hours into a fast, your cells activate a cleanup process called autophagy — literally "self-eating." Your cells identify damaged proteins, broken organelles, and cellular waste, then break them down and recycle the parts into new, healthy components. Think of it as your body\'s built-in maintenance crew. This process is linked to reduced inflammation, slower aging, and lower risk of diseases like cancer and Alzheimer\'s.',
              },
              {
                id: 'longevity',
                icon: '/icon-longevity.png',
                label: 'Longevity',
                title: 'Longevity',
                content: 'Regular fasting triggers several pathways associated with a longer, healthier life. Growth hormone increases significantly (up to 5x), helping preserve muscle and burn fat. Your cells become more resilient to stress through a process called hormesis — small challenges that make them stronger. Studies in both animals and humans show that consistent fasting improves metabolic health markers, reduces chronic inflammation, and may slow biological aging at the cellular level.',
              },
            ]

            return (
              <>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {benefits.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setActiveBenefit(activeBenefit === b.id ? null : b.id)}
                      className={`inline-flex h-9 items-center gap-2 rounded-full pr-3.5 text-[var(--fl-text-xs)] font-medium transition-colors ${activeBenefit === b.id ? 'bg-[var(--fl-primary)] text-white' : 'bg-[var(--fl-bg-secondary)] text-[var(--fl-text-secondary)] hover:bg-[var(--fl-bg-tertiary)]'}`}
                    >
                      <Image src={b.icon} alt={b.label} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                      {b.label}
                    </button>
                  ))}
                </div>

                {activeBenefit && (() => {
                  const benefit = benefits.find((b) => b.id === activeBenefit)
                  if (!benefit) return null
                  return (
                    <div className="w-full rounded-xl bg-[var(--fl-bg-secondary)] p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Image src={benefit.icon} alt={benefit.label} width={40} height={40} className="rounded-full" />
                        <h3 className="text-[var(--fl-text-sm)] font-bold text-[var(--fl-text)]">
                          {benefit.title}
                        </h3>
                      </div>
                      <p className="text-[var(--fl-text-xs)] leading-relaxed text-[var(--fl-text-secondary)]">
                        {benefit.content}
                      </p>
                    </div>
                  )
                })()}
              </>
            )
          })()}

          {/* How It Works — accordion (collapsed by default) */}
          <div className="w-full">
            <button
              type="button"
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="flex w-full items-center justify-center gap-1.5 py-2 text-[var(--fl-text-xs)] font-medium text-[var(--fl-primary)] transition-colors hover:text-[var(--fl-primary-hover)]"
            >
              How It Works
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showHowItWorks ? 'rotate-180' : ''}`}
              />
            </button>

            {showHowItWorks && (
              <div className="mt-1 w-full rounded-2xl bg-[var(--fl-bg-secondary)] p-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: UtensilsCrossed, text: 'Finish your last meal', color: 'text-orange-500' },
                    { icon: Moon, text: 'Tap Start — sleep through most of it', color: 'text-violet-500' },
                    { icon: GlassWater, text: 'Stay hydrated — water, coffee & tea are OK', color: 'text-blue-500' },
                    { icon: Sun, text: 'Timer ends — enjoy your eating window!', color: 'text-amber-500' },
                  ].map((item) => (
                    <div
                      key={item.text}
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
            )}
          </div>

          {/* Tips for Success — accordion (collapsed by default) */}
          <div className="w-full">
            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              className="flex w-full items-center justify-center gap-1.5 py-2 text-[var(--fl-text-xs)] font-medium text-[var(--fl-primary)] transition-colors hover:text-[var(--fl-primary-hover)]"
            >
              <Lightbulb size={14} />
              Tips for Success
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showTips ? 'rotate-180' : ''}`}
              />
            </button>

            {showTips && (
              <div className="mt-1 rounded-xl bg-[var(--fl-bg-secondary)] p-4">
                <div className="space-y-3">
                  {[
                    {
                      title: 'Start after dinner',
                      detail: 'Most people finish eating around 7–8pm and start their fast. You sleep through 7–8 hours of it — that\'s the cheat code.',
                    },
                    {
                      title: 'Finish eating 2–3 hours before bed',
                      detail: 'This improves sleep quality and digestion. Your body can focus on repair instead of processing food.',
                    },
                    {
                      title: 'Ease into it',
                      detail: 'New to fasting? Start with 12 hours and work up to 16 over a week or two. The first few days are the hardest — it gets easier.',
                    },
                    {
                      title: 'Break your fast gently',
                      detail: 'Start with something light — fruit, yogurt, or eggs. Save the bigger meal for an hour later.',
                    },
                    {
                      title: 'This is a daily routine',
                      detail: 'IF works best as a lifestyle, not a one-time thing. Most people fast daily (16:8) and eat normally during their window — no special diet needed.',
                    },
                    {
                      title: 'Stay hydrated during fasting',
                      detail: 'Water, black coffee, and plain tea are all fine and won\'t break your fast. Use the water tracker to stay on top of it.',
                    },
                  ].map((tip) => (
                    <div key={tip.title} className="flex gap-3">
                      <span className="mt-0.5 text-[var(--fl-primary)]">•</span>
                      <div>
                        <p className="text-[var(--fl-text-sm)] font-semibold text-[var(--fl-text)]">
                          {tip.title}
                        </p>
                        <p className="mt-0.5 text-[var(--fl-text-xs)] leading-relaxed text-[var(--fl-text-secondary)]">
                          {tip.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* What is intermittent fasting? — accordion (collapsed by default) */}
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
