import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'

const { auth } = NextAuth(authConfig)

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- NextAuth's auth() type doesn't match Next.js 16 middleware signature exactly
export default auth as any

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon-.*|apple-touch-icon.*|manifest.json).*)',
  ],
}
