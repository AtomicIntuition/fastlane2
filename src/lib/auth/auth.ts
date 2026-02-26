import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { getDb } from '@/db'
import { authConfig } from './auth.config'
import { credentialsProvider } from './credentials'

// Lazy-initialise NextAuth so the database connection is not opened during
// `next build` on platforms without a writable filesystem (e.g. Vercel).

let _instance: ReturnType<typeof NextAuth> | null = null

function getInstance() {
  if (!_instance) {
    _instance = NextAuth({
      ...authConfig,
      adapter: DrizzleAdapter(getDb()),
      session: { strategy: 'jwt' },
      providers: [
        credentialsProvider,
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ],
    })
  }
  return _instance
}

// Re-export the four NextAuth exports with lazy initialization.
// Each wraps the real function so that the DB is only opened on first call.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handlers = new Proxy({} as any, {
  get(_, prop) {
    return Reflect.get(getInstance().handlers, prop)
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: ReturnType<typeof NextAuth>['auth'] = ((...args: any[]) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (getInstance().auth as any)(...args)) as ReturnType<typeof NextAuth>['auth']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signIn: ReturnType<typeof NextAuth>['signIn'] = ((...args: any[]) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (getInstance().signIn as any)(...args)) as ReturnType<typeof NextAuth>['signIn']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signOut: ReturnType<typeof NextAuth>['signOut'] = ((...args: any[]) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (getInstance().signOut as any)(...args)) as ReturnType<typeof NextAuth>['signOut']
