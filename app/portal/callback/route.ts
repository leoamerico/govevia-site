import { NextResponse } from 'next/server'

import { recordAuditEvent } from '@/lib/portal/auth'
import { portalApiFetchJson } from '@/lib/portal/apiClient'

const PORTAL_JWT_COOKIE_NAME = 'govevia_portal_jwt'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractJwt(value: unknown): string | null {
  if (!isRecord(value)) return null
  const candidates = [value.jwt, value.token, value.access_token]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c.trim()
  }
  return null
}

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

    const exchanged = await portalApiFetchJson(`/api/v1/portal/auth/exchange?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      timeoutMs: 2000,
    })

    const jwt = extractJwt(exchanged)

    if (typeof jwt !== 'string' || jwt.trim().length < 20) {
      throw new Error('invalid jwt')
    }

    // Cookie TTL conservador (sem confiar em claims). Ajuste fino pode vir em etapa posterior.
    const ttlSeconds = 7 * 24 * 60 * 60

    try {
      await recordAuditEvent({
        contactId: null,
        eventType: 'portal_login_jwt_exchanged',
        actorType: 'system',
        actorRef: null,
        metadata: {},
      })
    } catch {
      // best-effort (não deve bloquear o login)
    }

    const res = NextResponse.redirect(new URL('/portal', url.origin))
    res.cookies.set(PORTAL_JWT_COOKIE_NAME, jwt, cookieOptions(ttlSeconds))
    return res
  } catch {
    return NextResponse.redirect(new URL('/portal/login?error=link', url.origin))
  }
}
