'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Droplet, ChevronDown, UtensilsCrossed, Moon, GlassWater, Sun, Lightbulb } from 'lucide-react'
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
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showTips, setShowTips] = useState(false)

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

          <BodyStateCard elapsedHours={elapsedHours} fastingHours={timerStore.fastingHours ?? 16} className="w-full" />

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
            onReduce={handleReduce}
            onCancel={handleCancel}
            extendedHours={timerStore.extendedHours}
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
        <div className="flex flex-col items-center justify-center gap-6 pt-6">
          {/* Title */}
          <h1 className="text-center font-[family-name:var(--font-playfair)] text-[2rem] font-black italic leading-tight tracking-tight text-[var(--fl-text)]">
            Intermittent Fasting
          </h1>

          {/* Protocol chip */}
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

          {/* Benefit pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: '/icon-fat-burning.png', label: 'Fat Burning' },
              { icon: '/icon-mental-clarity.png', label: 'Mental Clarity' },
              { icon: '/icon-cell-repair.png', label: 'Cell Repair' },
              { icon: '/icon-longevity.png', label: 'Longevity' },
            ].map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--fl-bg-secondary)] py-2 pl-2 pr-3.5 text-[var(--fl-text-xs)] font-medium text-[var(--fl-text-secondary)]"
              >
                <Image src={b.icon} alt={b.label} width={28} height={28} className="rounded-full" />
                {b.label}
              </span>
            ))}
          </div>

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
