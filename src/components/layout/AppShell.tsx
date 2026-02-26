'use client'

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { AppHeader } from '@/components/layout/AppHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

/* ------------------------------------------------------------------ */
/*  Context types                                                      */
/* ------------------------------------------------------------------ */

export interface AppUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export interface AppContextValue {
  user: AppUser
  planId: 'free' | 'pro'
}

const AppContext = createContext<AppContextValue | null>(null)

/**
 * Consume the AppContext. Must be used inside AppShell.
 * Throws if called outside the provider.
 */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp() must be used within an <AppShell> component')
  }
  return ctx
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface AppShellProps {
  children: ReactNode
  user: AppUser
  planId: 'free' | 'pro'
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AppShell({ children, user, planId }: AppShellProps) {
  const isPro = planId === 'pro'

  return (
    <AppContext.Provider value={{ user, planId }}>
      {/* Sidebar (desktop: persistent, mobile: slide-out) */}
      <Sidebar
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
        userImage={user.image}
        isPro={isPro}
      />

      {/* Header (always visible) */}
      <div className="lg:pl-64">
        <AppHeader
          userName={user.name ?? undefined}
          userImage={user.image}
        />

        {/* Main content */}
        <main
          id="main-content"
          className="min-h-[calc(100dvh-3.5rem)] px-4 py-6 pb-24 lg:px-8 lg:pb-8"
        >
          {children}
        </main>
      </div>

      {/* Bottom navigation (mobile only) */}
      <BottomNav />
    </AppContext.Provider>
  )
}
