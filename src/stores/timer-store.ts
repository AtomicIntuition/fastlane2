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
  waterGlasses: number

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
  addWater: () => void
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
      waterGlasses: 0,
      isActive: false,

      startTimer: (session) =>
        set({
          sessionId: session.id,
          protocol: session.protocol,
          startedAt: session.startedAt,
          targetEndAt: session.targetEndAt,
          fastingHours: session.fastingHours,
          eatingHours: session.eatingHours,
          waterGlasses: 0,
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

      addWater: () =>
        set((state) => ({
          waterGlasses: state.waterGlasses + 1,
        })),

      clear: () =>
        set({
          sessionId: null,
          protocol: null,
          startedAt: null,
          targetEndAt: null,
          fastingHours: null,
          eatingHours: null,
          waterGlasses: 0,
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
        waterGlasses: state.waterGlasses,
        isActive: state.isActive,
      }),
    }
  )
)
