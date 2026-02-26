'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTimerStore } from '@/stores/timer-store'
import { toast } from '@/components/ui/Toast'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FastingSessionData {
  id: string
  userId: string
  protocol: string
  fastingHours: number
  eatingHours: number
  startedAt: number
  targetEndAt: number
  actualEndAt: number | null
  status: 'active' | 'completed' | 'cancelled'
  notes: string | null
  createdAt: number
}

interface ApiResponse<T> {
  data: T
  error?: string
}

interface CheckinPayload {
  mood: 'great' | 'good' | 'okay' | 'rough' | 'terrible'
  hungerLevel: number
  energyLevel: number
  notes?: string
  fastingSessionId?: string
}

/* ------------------------------------------------------------------ */
/*  Query keys                                                         */
/* ------------------------------------------------------------------ */

export const fastingKeys = {
  all: ['fasting'] as const,
  history: () => [...fastingKeys.all, 'history'] as const,
  active: () => [...fastingKeys.all, 'active'] as const,
  checkins: () => ['checkins'] as const,
}

/* ------------------------------------------------------------------ */
/*  Fetchers                                                           */
/* ------------------------------------------------------------------ */

async function fetchHistory(): Promise<FastingSessionData[]> {
  const res = await fetch('/api/fasting/history')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch history')
  }
  const json: ApiResponse<FastingSessionData[]> = await res.json()
  return json.data
}

async function postFasting<T>(
  endpoint: string,
  body: object,
): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({ error: 'Unexpected response' }))
  if (!res.ok) {
    throw new Error(json.error ?? `Request failed (${res.status})`)
  }
  return json.data as T
}

/* ------------------------------------------------------------------ */
/*  useActiveSession                                                   */
/* ------------------------------------------------------------------ */

export function useActiveSession(initialSession?: FastingSessionData | null) {
  return useQuery({
    queryKey: fastingKeys.active(),
    queryFn: async (): Promise<FastingSessionData | null> => {
      const sessions = await fetchHistory()
      return sessions.find((s) => s.status === 'active') ?? null
    },
    initialData: initialSession ?? undefined,
    refetchInterval: 30_000, // Poll every 30s to stay in sync
  })
}

/* ------------------------------------------------------------------ */
/*  useSessionHistory                                                  */
/* ------------------------------------------------------------------ */

export function useSessionHistory(
  initialData?: FastingSessionData[],
) {
  return useQuery({
    queryKey: fastingKeys.history(),
    queryFn: fetchHistory,
    initialData,
  })
}

/* ------------------------------------------------------------------ */
/*  useStartFast                                                       */
/* ------------------------------------------------------------------ */

export function useStartFast() {
  const queryClient = useQueryClient()
  const startTimer = useTimerStore((s) => s.startTimer)

  return useMutation({
    mutationFn: (protocol: string) =>
      postFasting<FastingSessionData>('/api/fasting/start', { protocol }),
    onSuccess: (session) => {
      // Sync the timer store
      startTimer({
        id: session.id,
        protocol: session.protocol,
        startedAt: session.startedAt,
        targetEndAt: session.targetEndAt,
        fastingHours: session.fastingHours,
        eatingHours: session.eatingHours,
      })

      queryClient.invalidateQueries({ queryKey: fastingKeys.all })
      toast.success('Fast started!', {
        description: `${session.protocol} protocol - ${session.fastingHours}h fast`,
      })
    },
    onError: (error: Error) => {
      toast.error('Could not start fast', {
        description: error.message,
      })
    },
  })
}

/* ------------------------------------------------------------------ */
/*  useCompleteFast                                                    */
/* ------------------------------------------------------------------ */

export function useCompleteFast() {
  const queryClient = useQueryClient()
  const clear = useTimerStore((s) => s.clear)

  return useMutation({
    mutationFn: (sessionId: string) =>
      postFasting<FastingSessionData>('/api/fasting/complete', { sessionId }),
    onSuccess: () => {
      clear()
      queryClient.invalidateQueries({ queryKey: fastingKeys.all })
      toast.success('Fast completed!', {
        description: 'Great job! How are you feeling?',
      })
    },
    onError: (error: Error) => {
      toast.error('Could not complete fast', {
        description: error.message,
      })
    },
  })
}

/* ------------------------------------------------------------------ */
/*  useCancelFast                                                      */
/* ------------------------------------------------------------------ */

export function useCancelFast() {
  const queryClient = useQueryClient()
  const clear = useTimerStore((s) => s.clear)

  return useMutation({
    mutationFn: (sessionId: string) =>
      postFasting<FastingSessionData>('/api/fasting/cancel', { sessionId }),
    onSuccess: () => {
      clear()
      queryClient.invalidateQueries({ queryKey: fastingKeys.all })
      toast.info('Fast cancelled')
    },
    onError: (error: Error) => {
      toast.error('Could not cancel fast', {
        description: error.message,
      })
    },
  })
}

/* ------------------------------------------------------------------ */
/*  useExtendFast                                                      */
/* ------------------------------------------------------------------ */

export function useExtendFast() {
  const queryClient = useQueryClient()
  const updateTarget = useTimerStore((s) => s.updateTarget)

  return useMutation({
    mutationFn: ({
      sessionId,
      additionalHours,
    }: {
      sessionId: string
      additionalHours: number
    }) =>
      postFasting<FastingSessionData>('/api/fasting/extend', {
        sessionId,
        additionalHours,
      }),
    onSuccess: (session) => {
      updateTarget(session.targetEndAt, session.fastingHours)
      queryClient.invalidateQueries({ queryKey: fastingKeys.all })
      toast.success('Fast extended!', {
        description: `New target: ${session.fastingHours}h`,
      })
    },
    onError: (error: Error) => {
      toast.error('Could not extend fast', {
        description: error.message,
      })
    },
  })
}

/* ------------------------------------------------------------------ */
/*  useSubmitCheckin                                                    */
/* ------------------------------------------------------------------ */

export function useSubmitCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CheckinPayload) =>
      postFasting<unknown>('/api/checkin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fastingKeys.checkins() })
      toast.success('Check-in saved!', {
        description: 'Your daily check-in has been recorded.',
      })
    },
    onError: (error: Error) => {
      toast.error('Could not save check-in', {
        description: error.message,
      })
    },
  })
}
