import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user

      // Only these routes strictly require authentication
      const isProtectedRoute =
        nextUrl.pathname.startsWith('/settings') ||
        nextUrl.pathname.startsWith('/admin') ||
        nextUrl.pathname.startsWith('/onboarding')

      const isAuthRoute =
        nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/register')

      if (isProtectedRoute) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL('/timer', nextUrl))
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
