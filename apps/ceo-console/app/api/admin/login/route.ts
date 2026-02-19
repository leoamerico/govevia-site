import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signAdminToken, cookieOptions, requireEnv } from '@/lib/auth/admin'

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const { username, password } = body

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const ADMIN_USERNAME = requireEnv('ADMIN_USERNAME')
  const ADMIN_PASSWORD_HASH = requireEnv('ADMIN_PASSWORD_HASH')
  const ttl = Number(process.env.ADMIN_JWT_TTL_SECONDS ?? '28800')

  // Constant-time username check via bcrypt-like approach: always run compare
  if (username !== ADMIN_USERNAME) {
    // Still run compare to prevent timing side-channel on username validity
    await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  if (!valid) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  let jwt: string
  try {
    jwt = await signAdminToken(ttl)
  } catch (err) {
    console.error('[auth/login] JWT sign failed:', err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set({ ...cookieOptions(ttl), value: jwt })
  return res
}
