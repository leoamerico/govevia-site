import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { COOKIE_NAME, ISSUER, AUDIENCE } from '@/lib/auth/admin'

const ALLOW = new Set([
  '/admin/login',
  '/admin/login/',
  '/api/admin/login',
  '/api/admin/logout',
])

const DENY = new NextResponse('Not Found', {
  status: 404,
  headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow, noarchive' },
})

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (ALLOW.has(pathname)) return NextResponse.next()

  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret || secret.length < 32) return DENY

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))

  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
    })
  } catch {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  const res = NextResponse.next()
  res.headers.set('x-robots-tag', 'noindex, nofollow, noarchive')
  res.headers.set('cache-control', 'no-store')
  return res
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

