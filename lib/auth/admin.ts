import 'server-only'

import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE_NAME = 'govevia_admin_session'
export const ADMIN_JWT_ISSUER = 'govevia-admin'
export const ADMIN_JWT_AUDIENCE = 'govevia-admin'

export type AdminSession = {
  username: string
  role: 'admin'
  iat: number
  exp: number
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

function getAdminSecretOrNull(): Uint8Array | null {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) return null
  if (secret.length < 32) return null
  return new TextEncoder().encode(secret)
}

function requireAdminSecret(): Uint8Array {
  const secret = getAdminSecretOrNull()
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is required (min 32 chars)')
  }
  return secret
}

function getTtlSeconds(): number {
  const raw = process.env.ADMIN_SESSION_TTL_SECONDS
  if (!raw) return 86_400
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return 86_400
  return parsed
}

function getCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const expectedUsername = requireEnv('ADMIN_USERNAME')
  const passwordHash = requireEnv('ADMIN_PASSWORD_HASH')

  if (username !== expectedUsername) return false
  return bcrypt.compare(password, passwordHash)
}

export async function createAdminSession(username: string): Promise<void> {
  const secret = requireAdminSecret()
  const ttlSeconds = getTtlSeconds()
  const now = Math.floor(Date.now() / 1000)

  const token = await new SignJWT({ role: 'admin' as const })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ADMIN_JWT_ISSUER)
    .setAudience(ADMIN_JWT_AUDIENCE)
    .setSubject(username)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(secret)

  cookies().set(ADMIN_COOKIE_NAME, token, getCookieOptions(ttlSeconds))
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const secret = getAdminSecretOrNull()
  if (!secret) return null
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: ADMIN_JWT_ISSUER,
      audience: ADMIN_JWT_AUDIENCE,
    })

    const username = typeof payload.sub === 'string' ? payload.sub : null
    const role = payload.role === 'admin' ? 'admin' : null
    const iat = typeof payload.iat === 'number' ? payload.iat : null
    const exp = typeof payload.exp === 'number' ? payload.exp : null

    if (!username || !role || !iat || !exp) return null
    return { username, role, iat, exp }
  } catch {
    return null
  }
}

export function deleteAdminSession(): void {
  const options = getCookieOptions(0)
  cookies().set(ADMIN_COOKIE_NAME, '', { ...options, maxAge: 0 })
}
