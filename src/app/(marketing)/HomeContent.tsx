'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Droplet, Clock, Flame } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { useTimer } from '@/hooks/use-timer'
import { useTimerStore } from '@/stores/timer-store'
import { TimerRing } from '@/components/fasting/TimerRing'
import { ProtocolPicker } from '@/components/fasting/ProtocolPicker'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { getCurrentBodyState, getNextBodyState } from '@/lib/fasting/body-states'
import { getProtocol, type FastingProtocol } from '@/lib/fasting/protocols'
import { formatDuration } from '@/lib/utils/dates'
import { generateId } from '@/lib/utils/id'

export function HomeContent() {
  const timer = useTimer()
  const timerStore = useTimerStore()
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>('16-8')
  const [showProtocols, setShowProtocols] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const isActive = timer.isActive

  const handleStart = useCallback(() => {
    const pid = selectedProtocol ?? '16-8'
    const protocol = getProtocol(pid)
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
  }, [selectedProtocol, timerStore])

  const handleComplete = useCallback(() => {
    timerStore.clear()
  }, [timerStore])

  const handleCancel = useCallback(() => {
    timerStore.clear()
  }, [timerStore])

  const handleExtend = useCallback(() => {
    if (!timerStore.targetEndAt || !timerStore.fastingHours) return
    timerStore.updateTarget(
      timerStore.targetEndAt + 3_600_000,
      timerStore.fastingHours + 1,
    )
    timerStore.addExtendedHour()
  }, [timerStore])

  const handleReduce = useCallback(() => {
    if (timerStore.extendedHours <= 0) return
    if (!timerStore.targetEndAt || !timerStore.fastingHours) return
    timerStore.updateTarget(
      timerStore.targetEndAt - 3_600_000,
      timerStore.fastingHours - 1,
    )
    timerStore.removeExtendedHour()
  }, [timerStore])

  const handleProtocolSelect = useCallback((protocol: FastingProtocol) => {
    setSelectedProtocol(protocol.id)
    setShowProtocols(false)
  }, [])

  const handleAddWater = useCallback(() => {
    timerStore.addWater()
  }, [timerStore])

  const handleRemoveWater = useCallback(() => {
    if (timerStore.waterGlasses <= 0) return
    timerStore.removeWater()
  }, [timerStore])

  const protocolInfo = selectedProtocol ? getProtocol(selectedProtocol) : null
  const activeProtocolInfo = timer.protocol ? getProtocol(timer.protocol) : null
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
    <div className="relative flex min-h-dvh flex-col items-center bg-[var(--fl-bg)]">
      {/* Gradient accent bar */}
      <div className="fixed inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-amber-500" />

      <main className="relative z-10 flex w-full max-w-lg flex-1 flex-col px-4 pb-24 pt-10 sm:px-6">
        <div className="flex flex-1 flex-col items-center gap-8">
          {/* App icon + tagline */}
          <div className="text-center">
            <Image
              src="/icon.png"
              alt="FastLane"
              width={64}
              height={64}
              className="mx-auto mb-4 rounded-2xl shadow-lg shadow-violet-500/20"
            />
            <h1 className="text-2xl font-bold text-[var(--fl-text)]">FastLane</h1>
            <p className="mt-1 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
              Intermittent fasting, simplified
            </p>
          </div>

          {isActive ? (
            /* ── Active fast — timer replaces start button ───── */
            <>
              <TimerRing
                progress={timer.progress}
                hours={timer.hours}
                minutes={timer.minutes}
                seconds={timer.seconds}
                isComplete={timer.isComplete}
                isOvertime={timer.isOvertime}
                overtimeMs={timer.overtimeMs}
                protocol={activeProtocolInfo?.name ?? timer.protocol}
                isActive
                onEndFast={() => setShowEndConfirm(true)}
              />

              {/* Status */}
              <p className="text-base font-semibold text-[var(--fl-text)] text-center">
                {timer.isComplete
                  ? 'You crushed it! Tap End Fast or keep going.'
                  : `${formatDuration(timer.remaining)} remaining`}
              </p>

              {/* Quick actions */}
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

              {/* Sign-up nudge */}
              <p className="text-center text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                <Link href="/register" className="underline hover:text-[var(--fl-text-secondary)]">
                  Create an account
                </Link>{' '}
                to save your progress
              </p>

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
            </>
          ) : (
            /* ── Ready to start ──────────────────────────────── */
            <>
              {/* Selected protocol display */}
              {protocolInfo && !showProtocols && (
                <button
                  type="button"
                  onClick={() => setShowProtocols(true)}
                  className="flex items-center gap-2 rounded-[var(--fl-radius-lg)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-2.5 transition-colors hover:border-[var(--fl-border-hover)]"
                >
                  <span className="text-[var(--fl-text-sm)] font-bold text-[var(--fl-primary)]">
                    {protocolInfo.name}
                  </span>
                  <span className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                    {protocolInfo.fastingHours}h fast / {protocolInfo.eatingHours}h eat
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
                    isPro={false}
                  />
                </div>
              )}

              {/* THE BUTTON */}
              <button
                type="button"
                onClick={handleStart}
                className="group relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-amber-500 text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-2xl hover:shadow-violet-500/30 active:scale-95"
              >
                {/* Pulsing ring */}
                <span className="absolute inset-0 animate-ping rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-amber-500 opacity-20" style={{ animationDuration: '2s' }} />
                <span className="absolute -inset-2 animate-pulse rounded-full border-2 border-violet-400/30" style={{ animationDuration: '2s' }} />

                <span className="relative text-lg font-bold uppercase tracking-wider">
                  Start<br />Fast
                </span>
              </button>

              {/* Tap hint */}
              <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                Tap to start a {protocolInfo?.fastingHours ?? 16}h fast
              </p>

              {/* Sign in link */}
              <p className="text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-[var(--fl-primary)] hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      {/* Guest bottom nav */}
      <BottomNav guest />
    </div>
  )
}
