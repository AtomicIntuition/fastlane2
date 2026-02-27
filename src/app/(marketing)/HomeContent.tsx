'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Droplet } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { useTimer } from '@/hooks/use-timer'
import { useTimerStore } from '@/stores/timer-store'
import { TimerRing } from '@/components/fasting/TimerRing'
import { TimerControls } from '@/components/fasting/TimerControls'
import { ProtocolPicker } from '@/components/fasting/ProtocolPicker'
import { BodyStateCard } from '@/components/fasting/BodyStateCard'
import { BodyStateTimeline } from '@/components/fasting/BodyStateTimeline'
import { Card } from '@/components/ui/Card'
import { getProtocol, type FastingProtocol } from '@/lib/fasting/protocols'
import { formatDuration } from '@/lib/utils/dates'
import { generateId } from '@/lib/utils/id'

export function HomeContent() {
  const timer = useTimer()
  const timerStore = useTimerStore()
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>('16-8')
  const [showProtocols, setShowProtocols] = useState(false)

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
  }, [timerStore])

  const handleProtocolSelect = useCallback((protocol: FastingProtocol) => {
    setSelectedProtocol(protocol.id)
    setShowProtocols(false)
  }, [])

  const handleAddWater = useCallback(() => {
    timerStore.addWater()
  }, [timerStore])

  const protocolInfo = selectedProtocol ? getProtocol(selectedProtocol) : null
  const activeProtocolInfo = timer.protocol ? getProtocol(timer.protocol) : null
  const elapsedHours = timer.elapsed / 3_600_000

  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-[var(--fl-bg)]">
      {/* Gradient accent bar */}
      <div className="fixed inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-amber-500" />

      <main className="relative z-10 flex w-full max-w-lg flex-1 flex-col px-4 pb-24 pt-10 sm:px-6">
        {isActive ? (
          /* ── Active fast ─────────────────────────────────── */
          <div className="flex flex-1 flex-col items-center gap-5">
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
            />

            <BodyStateCard elapsedHours={elapsedHours} className="w-full" />

            {/* Water */}
            <button
              type="button"
              onClick={handleAddWater}
              className="flex items-center gap-2 rounded-[var(--fl-radius-lg)] border border-[var(--fl-border)] bg-[var(--fl-bg)] px-4 py-2 text-[var(--fl-text-sm)] font-medium text-[var(--fl-info)] transition-colors hover:bg-blue-50 active:scale-95"
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

            <Card padding="md" className="w-full">
              <h3 className="mb-3 text-sm font-semibold text-[var(--fl-text)]">
                Body State Timeline
              </h3>
              <BodyStateTimeline
                elapsedHours={elapsedHours}
                fastingHours={timerStore.fastingHours ?? 16}
              />
            </Card>

            {/* Subtle sign-up nudge */}
            <p className="text-center text-[var(--fl-text-xs)] text-[var(--fl-text-tertiary)]">
              <Link href="/register" className="underline hover:text-[var(--fl-text-secondary)]">
                Create an account
              </Link>{' '}
              to save your progress
            </p>
          </div>
        ) : (
          /* ── Ready to start ──────────────────────────────── */
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
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
          </div>
        )}
      </main>

      {/* Guest bottom nav */}
      <BottomNav guest />
    </div>
  )
}
