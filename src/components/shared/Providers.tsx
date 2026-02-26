'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState, useEffect, type ReactNode } from 'react'
import { Toaster } from '@/components/ui/Toast'

// Module-level CSRF token so all fetch calls can access it
let csrfToken: string | null = null

export function getCsrfToken(): string | null {
  return csrfToken
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  useEffect(() => {
    fetch('/api/csrf')
      .then((res) => res.json())
      .then((data) => {
        csrfToken = data.csrfToken
      })
      .catch(() => {
        // CSRF fetch failed — mutations will fail gracefully
      })
  }, [])

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </SessionProvider>
  )
}
