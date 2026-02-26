'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Zap, Droplet } from 'lucide-react'
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

export function GuestTimerContent() {
  const timer = useTimer()
  const timerStore = useTimerStore()

  const [selectedProtocol, setSelectedProtocol] = useState<string | null>('16-8')

  const isActive = timer.isActive

  const handleStart = useCallback(() => {
    if (!selectedProtocol) return
    const protocol = getProtocol(selectedProtocol)
    if (!protocol) return

    const now = Date.now()
    const targetEnd = now + protocol.fastingHours * 60 * 60 * 1000

    timerStore.startTimer({
      id: generateId(),
      protocol: protocol.id,
      startedAt: now,
      targetEndAt: targetEnd,
      fastingHours: protocol.fastingHours,
      eatingHours: protocol.eatingHours,
    })
  }, [selectedProtocol, timerStore])

  const handleComplete = useCallback(() => {
    timerStore.clear()
  }, [timerStore])

  const handleCancel = useCallback(() => {
    timerStore.clear()
  }, [timerStore])

  const handleExtend = useCallback(() => {
    if (!timerStore.targetEndAt || !timerStore.fastingHours) return
    const newTarget = timerStore.targetEndAt + 1 * 60 * 60 * 1000
    timerStore.updateTarget(newTarget, timerStore.fastingHours + 1)
  }, [timerStore])

  const handleProtocolSelect = useCallback((protocol: FastingProtocol) => {
    setSelectedProtocol(protocol.id)
  }, [])

  const handleAddWater = useCallback(() => {
    timerStore.addWater()
  }, [timerStore])

  const protocolInfo = timer.protocol ? getProtocol(timer.protocol) : null
  const elapsedHours = timer.elapsed / 3_600_000

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-xl font-bold text-[var(--fl-text)] text-center">
        {isActive ? 'Fasting in Progress' : 'Try FastLane'}
      </h2>

      {isActive ? (
        <div className="flex flex-col items-center gap-6">
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

          {/* Water tracking (local only) */}
          <button
            type="button"
            onClick={handleAddWater}
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
          />

          <Card padding="md" className="w-full">
            <h3 className="mb-3 text-sm font-semibold text-[var(--fl-text)]">Body State Timeline</h3>
            <BodyStateTimeline
              elapsedHours={elapsedHours}
              fastingHours={timerStore.fastingHours ?? 16}
            />
          </Card>
        </div>
      ) : (
        <Card padding="lg" className="flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fl-primary)]/10">
              <Zap size={28} className="text-[var(--fl-primary)]" />
            </div>
            <p className="text-sm text-[var(--fl-text-secondary)]">
              Choose a protocol to begin.
            </p>
          </div>

          <ProtocolPicker
            selectedProtocol={selectedProtocol}
            onSelect={handleProtocolSelect}
            isPro={false}
          />

          <TimerControls
            isActive={false}
            onStart={handleStart}
            onComplete={handleComplete}
            onExtend={handleExtend}
            onCancel={handleCancel}
          />
        </Card>
      )}

      {/* CTA banner */}
      <Card padding="md" className="text-center">
        <p className="text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
          Create an account to save your progress and unlock more protocols.
        </p>
        <Link
          href="/register"
          className="mt-2 inline-block rounded-[var(--fl-radius-md)] bg-[var(--fl-primary)] px-4 py-2 text-[var(--fl-text-sm)] font-semibold text-white transition-colors hover:bg-[var(--fl-primary-hover)]"
        >
          Create Account to Save Progress
        </Link>
      </Card>
    </div>
  )
}
