import { NextResponse } from 'next/server'

import {
  extractIpFromHeaders,
  extractUserAgentFromHeaders,
  issueSession,
  validateAndConsumeLoginToken,
  PORTAL_SESSION_COOKIE_NAME,
} from '@/lib/portal/auth'

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  try {
    if (!token) return NextResponse.redirect(new URL('/portal/login?error=link', url.origin))

    const consumed = await validateAndConsumeLoginToken(token)

    const ttlDays = 7
    const ttlSeconds = ttlDays * 24 * 60 * 60
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)

    const session = await issueSession(consumed.contactId, {
      expiresAt,
      ip: extractIpFromHeaders(request.headers),
      userAgent: extractUserAgentFromHeaders(request.headers),
    })

    const res = NextResponse.redirect(new URL('/portal', url.origin))
    res.cookies.set(PORTAL_SESSION_COOKIE_NAME, session.token, cookieOptions(ttlSeconds))
    return res
  } catch {
    return NextResponse.redirect(new URL('/portal/login?error=link', url.origin))
  }
}
