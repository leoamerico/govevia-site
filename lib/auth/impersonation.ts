import 'server-only'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// ─── Cookie names ────────────────────────────────────────────────────────────
// httpOnly: for server-side trusted auth checks (JWT signed)
export const IMPERSONATION_COOKIE = 'govevia_impersonation'
// NOT httpOnly: for client-side banner rendering (plain JSON, display-only)
export const IMPERSONATION_INFO_COOKIE = 'govevia_impersonation_info'

const ISSUER = 'govevia-admin'
const AUDIENCE = 'govevia-impersonation'
const TTL_SECONDS = 8 * 60 * 60 // 8 hours

export type ImpersonationSession = {
  personaId: string
  personaLabel: string
  contextId: string | null
  contextLabel: string | null
  activatedBy: string
  activatedAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSecretOrNull(): Uint8Array | null {
  const s = process.env.ADMIN_SESSION_SECRET
  if (!s || s.length < 32) return null
  return new TextEncoder().encode(s)
}

function requireSecret(): Uint8Array {
  const s = getSecretOrNull()
  if (!s) throw new Error('ADMIN_SESSION_SECRET is required (min 32 chars)')
  return s
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function createImpersonationSession(
  personaId: string,
  personaLabel: string,
  contextId: string | null,
  contextLabel: string | null,
  activatedBy: string,
): Promise<void> {
  const secret = requireSecret()
  const now = Math.floor(Date.now() / 1000)
  const activatedAt = new Date().toISOString()

  const token = await new SignJWT({
    personaId,
    personaLabel,
    contextId,
    contextLabel,
    activatedBy,
    activatedAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + TTL_SECONDS)
    .sign(secret)

  const base = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TTL_SECONDS,
  }

  // Signed session — httpOnly (server-side auth)
  cookies().set(IMPERSONATION_COOKIE, token, { ...base, httpOnly: true })

  // Display info — NOT httpOnly (client-side banner)
  const info = JSON.stringify({ personaId, personaLabel, contextId, contextLabel })
  cookies().set(IMPERSONATION_INFO_COOKIE, encodeURIComponent(info), {
    ...base,
    httpOnly: false,
  })
}

export async function getImpersonationSession(): Promise<ImpersonationSession | null> {
  const secret = getSecretOrNull()
  if (!secret) return null

  const token = cookies().get(IMPERSONATION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
    })

    const personaId = typeof payload.personaId === 'string' ? payload.personaId : null
    const personaLabel = typeof payload.personaLabel === 'string' ? payload.personaLabel : null
    const activatedBy = typeof payload.activatedBy === 'string' ? payload.activatedBy : null
    const activatedAt = typeof payload.activatedAt === 'string' ? payload.activatedAt : null

    if (!personaId || !personaLabel || !activatedBy || !activatedAt) return null

    return {
      personaId,
      personaLabel,
      contextId: typeof payload.contextId === 'string' ? payload.contextId : null,
      contextLabel: typeof payload.contextLabel === 'string' ? payload.contextLabel : null,
      activatedBy,
      activatedAt,
    }
  } catch {
    return null
  }
}

export function deleteImpersonationSession(): void {
  const gone = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
  cookies().set(IMPERSONATION_COOKIE, '', gone)
  cookies().set(IMPERSONATION_INFO_COOKIE, '', { ...gone, httpOnly: false })
}
