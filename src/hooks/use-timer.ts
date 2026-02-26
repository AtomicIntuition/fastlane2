'use client'

import { useState, useEffect, useRef } from 'react'
import { useTimerStore } from '@/stores/timer-store'

export interface TimerValues {
  elapsed: number
  remaining: number
  progress: number // 0-1
  hours: number
  minutes: number
  seconds: number
  isComplete: boolean
  isOvertime: boolean
  overtimeMs: number
}

export function useTimer(): TimerValues & {
  isActive: boolean
  sessionId: string | null
  protocol: string | null
} {
  const { sessionId, protocol, startedAt, targetEndAt, isActive } = useTimerStore()
  const [now, setNow] = useState(() => Date.now())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isActive || !startedAt || !targetEndAt) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => setNow(Date.now()), 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, startedAt, targetEndAt])

  // Handle visibility change - resync timer when tab becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && isActive) {
        setNow(Date.now())
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isActive])

  const totalDuration = (targetEndAt ?? 0) - (startedAt ?? 0)
  const elapsed = isActive && startedAt ? now - startedAt : 0
  const remaining = isActive && targetEndAt ? Math.max(0, targetEndAt - now) : 0
  const progress = totalDuration > 0 ? Math.min(1, elapsed / totalDuration) : 0
  const isComplete = isActive && remaining === 0
  const isOvertime = isActive && targetEndAt ? now > targetEndAt : false
  const overtimeMs = isOvertime && targetEndAt ? now - targetEndAt : 0

  const totalSeconds = Math.floor(remaining / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    elapsed,
    remaining,
    progress,
    hours,
    minutes,
    seconds,
    isComplete,
    isOvertime,
    overtimeMs,
    isActive,
    sessionId,
    protocol,
  }
}
