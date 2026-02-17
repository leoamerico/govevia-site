import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_COOKIE_NAME = 'govevia_admin_session'
const ADMIN_ISSUER = 'govevia-admin'
const ADMIN_AUDIENCE = 'govevia-admin'

function toOrigin(value: string | null): string | null {
  if (!value) return null

  const trimmed = value.trim()
  const candidates: string[] = [trimmed]
  // Permite values como "www.govevia.com.br" (sem protocolo) em env vars
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    candidates.push(`https://${trimmed.replace(/^\/\//, '')}`)
  }

  for (const candidate of candidates) {
    try {
      return new URL(candidate).origin
    } catch {
      // tentar próximo candidato
    }
  }

  return null
}

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>()

  // Canonical domains (evita depender de NEXT_PUBLIC_SITE_URL estar correto na Vercel)
  origins.add('https://govevia.com.br')
  origins.add('https://www.govevia.com.br')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://govevia.com.br'
  const siteOrigin = toOrigin(siteUrl)
  if (siteOrigin) {
    origins.add(siteOrigin)

    const hostname = new URL(siteOrigin).hostname
    const protocol = new URL(siteOrigin).protocol
    if (hostname.startsWith('www.')) {
      origins.add(`${protocol}//${hostname.replace(/^www\./, '')}`)
    } else {
      origins.add(`${protocol}//www.${hostname}`)
    }
  }

  origins.add('http://localhost:3000')

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    // VERCEL_URL vem sem protocolo (ex.: myapp.vercel.app)
    origins.add(`https://${vercelUrl}`)
  }

  return origins
}

// Aplicar em rotas de API (CSRF) e Admin (auth)
export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
}

function getAdminSecret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET
  if (!value) return null
  if (value.length < 32) return null
  return value
}

function buildAdminLoginRedirect(request: NextRequest): NextResponse {
  const from = `${request.nextUrl.pathname}${request.nextUrl.search}`
  const url = request.nextUrl.clone()
  url.pathname = '/admin/login'
  url.searchParams.set('from', from)
  return NextResponse.redirect(url)
}

async function enforceAdminAuth(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname

  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return NextResponse.next()
  }

  const secret = getAdminSecret()
  if (!secret) {
    return buildAdminLoginRedirect(request)
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!token) {
    return buildAdminLoginRedirect(request)
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
      issuer: ADMIN_ISSUER,
      audience: ADMIN_AUDIENCE,
    })
  } catch {
    return buildAdminLoginRedirect(request)
  }

  return NextResponse.next()
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return enforceAdminAuth(request)
  }

  // CSRF: Bloquear requisições sem Origin válido em rotas de API
  if (request.method === 'POST') {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const requestOrigin = toOrigin(origin) || toOrigin(referer)
    const allowedOrigins = getAllowedOrigins()

    // Permitir a origem real da requisição (mais confiável em Vercel)
    allowedOrigins.add(request.nextUrl.origin)

    // Permitir same-origin automaticamente (útil em previews *.vercel.app)
    const forwardedHostRaw = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const forwardedHost = forwardedHostRaw?.split(',')[0]?.trim()
    const proto = (request.headers.get('x-forwarded-proto') || 'https').split(',')[0].trim()
    if (forwardedHost) {
      const sameOrigin = toOrigin(`${proto}://${forwardedHost}`)
      if (sameOrigin) allowedOrigins.add(sameOrigin)
    }

    if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
      const response = NextResponse.json(
        { message: 'Requisição não autorizada.' },
        { status: 403 }
      )
      response.headers.set('x-govevia-csrf-block', 'middleware')
      return response
    }
  }

  return NextResponse.next()
}
