import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAppRoute = nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/timer') ||
        nextUrl.pathname.startsWith('/history') ||
        nextUrl.pathname.startsWith('/stats') ||
        nextUrl.pathname.startsWith('/settings') ||
        nextUrl.pathname.startsWith('/upgrade') ||
        nextUrl.pathname.startsWith('/onboarding')
      const isAuthRoute = nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/register')

      if (isAppRoute) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
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
