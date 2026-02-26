import { NextResponse } from 'next/server'
import { generateCsrfToken, CSRF_COOKIE } from '@/lib/security/csrf'

export async function GET() {
  const token = generateCsrfToken()

  const response = NextResponse.json({ csrfToken: token })

  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  })

  return response
}
