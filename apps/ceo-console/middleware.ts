import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_COOKIE = 'govevia_admin_session'
const ADMIN_ISSUER = 'govevia-admin'
const ADMIN_AUDIENCE = 'govevia-admin-ui'

function getSecret(): string | null {
  const v = process.env.ADMIN_SESSION_SECRET
  return v && v.length >= 32 ? v : null
}

const DENY = new NextResponse('Not Found', {
  status: 404,
  headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
})

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Página de login sempre acessível (porta de entrada)
  if (path === '/admin/login' || path === '/admin/login/') {
    return NextResponse.next()
  }

  const secret = getSecret()
  if (!secret) return DENY

  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (!token) return DENY

  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
      issuer: ADMIN_ISSUER,
      audience: ADMIN_AUDIENCE,
    })
  } catch {
    return DENY
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
