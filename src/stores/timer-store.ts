'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TimerState {
  // Session data
  sessionId: string | null
  protocol: string | null
  startedAt: number | null // UTC ms
  targetEndAt: number | null // UTC ms
  fastingHours: number | null
  eatingHours: number | null

  // Computed on each tick (not persisted, derived)
  isActive: boolean

  // Actions
  startTimer: (session: {
    id: string
    protocol: string
    startedAt: number
    targetEndAt: number
    fastingHours: number
    eatingHours: number
  }) => void
  stopTimer: () => void
  updateTarget: (targetEndAt: number, fastingHours: number) => void
  clear: () => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      sessionId: null,
      protocol: null,
      startedAt: null,
      targetEndAt: null,
      fastingHours: null,
      eatingHours: null,
      isActive: false,

      startTimer: (session) =>
        set({
          sessionId: session.id,
          protocol: session.protocol,
          startedAt: session.startedAt,
          targetEndAt: session.targetEndAt,
          fastingHours: session.fastingHours,
          eatingHours: session.eatingHours,
          isActive: true,
        }),

      stopTimer: () =>
        set({
          isActive: false,
        }),

      updateTarget: (targetEndAt, fastingHours) =>
        set({
          targetEndAt,
          fastingHours,
        }),

      clear: () =>
        set({
          sessionId: null,
          protocol: null,
          startedAt: null,
          targetEndAt: null,
          fastingHours: null,
          eatingHours: null,
          isActive: false,
        }),
    }),
    {
      name: 'fastlane-timer',
      partialize: (state) => ({
        sessionId: state.sessionId,
        protocol: state.protocol,
        startedAt: state.startedAt,
        targetEndAt: state.targetEndAt,
        fastingHours: state.fastingHours,
        eatingHours: state.eatingHours,
        isActive: state.isActive,
      }),
    }
  )
)
