'use client'

import { useCallback } from 'react'
import { analytics, EVENTS } from '@/lib/analytics'

export function useAnalytics() {
  const track = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      analytics.track(event, properties)
    },
    []
  )

  const page = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      analytics.page(name, properties)
    },
    []
  )

  return { track, page, EVENTS }
}
