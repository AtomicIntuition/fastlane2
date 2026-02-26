import { NextResponse, type NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'
import { checkRateLimit } from '@/lib/security/rate-limit'

const { auth } = NextAuth(authConfig)

function handleApiRateLimit(request: NextRequest): NextResponse | null {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  const { allowed, remaining, resetAt } = checkRateLimit(ip, request.nextUrl.pathname)

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
        },
      },
    )
  }

  // Attach rate limit headers to the response downstream
  const res = NextResponse.next()
  res.headers.set('X-RateLimit-Remaining', String(remaining))
  res.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))
  return res
}

export async function middleware(request: NextRequest) {
  // Rate-limit API routes before anything else
  if (request.nextUrl.pathname.startsWith('/api')) {
    const rateLimitResponse = handleApiRateLimit(request)
    if (rateLimitResponse && rateLimitResponse.status === 429) {
      return rateLimitResponse
    }
  }

  // For non-API routes, run NextAuth middleware
  if (!request.nextUrl.pathname.startsWith('/api')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NextAuth's auth() type doesn't match Next.js 16 middleware signature exactly
    return (auth as any)(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-.*|apple-touch-icon.*|manifest.json).*)',
  ],
}
