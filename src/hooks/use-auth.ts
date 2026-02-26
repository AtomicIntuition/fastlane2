'use client'

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { useCallback } from 'react'

/* ================================================================== */
/*  useCurrentUser                                                     */
/*                                                                     */
/*  Returns the current authenticated user from the NextAuth session.  */
/*  Returns null while the session is loading or if not authenticated. */
/* ================================================================== */

export interface CurrentUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export function useCurrentUser(): {
  user: CurrentUser | null
  isLoading: boolean
  isAuthenticated: boolean
} {
  const { data: session, status } = useSession()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'

  const user: CurrentUser | null =
    session?.user?.id
      ? {
          id: session.user.id as string,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
        }
      : null

  return { user, isLoading, isAuthenticated }
}

/* ================================================================== */
/*  useSignOut                                                         */
/*                                                                     */
/*  Provides a sign-out function that wraps next-auth/react signOut.   */
/*  Defaults to redirecting to the landing page.                       */
/* ================================================================== */

export function useSignOut() {
  const handleSignOut = useCallback(
    async (callbackUrl = '/') => {
      await nextAuthSignOut({ callbackUrl })
    },
    [],
  )

  return handleSignOut
}
