/**
 * lib/auth/admin.ts — Utilitários de autenticação do CEO Console
 * Cookie: varia por ambiente (ver constants.ts)
 * JWT: HS256, issuer=govevia-ceo, audience=govevia-ceo-ui
 */
import { SignJWT, jwtVerify } from 'jose'
import { ADMIN_COOKIE_NAME } from './constants'

export { ADMIN_COOKIE_NAME as COOKIE_NAME } from './constants'
export const ISSUER = 'govevia-ceo'
export const AUDIENCE = 'govevia-ceo-ui'

export function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

export function getSecret(): Uint8Array | null {
  const v = process.env.ADMIN_JWT_SECRET
  if (!v || v.length < 32) return null
  return new TextEncoder().encode(v)
}

export async function signAdminToken(ttlSeconds: number): Promise<string> {
  const secret = getSecret()
  if (!secret) throw new Error('ADMIN_JWT_SECRET not configured or too short (min 32 chars)')

  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({ sub: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  const secret = getSecret()
  if (!secret) return false
  try {
    await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
    })
    return true
  } catch {
    return false
  }
}

export function cookieOptions(ttlSeconds: number) {
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ttlSeconds,
  }
}
