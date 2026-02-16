import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function toOrigin(value: string | null): string | null {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>()

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

// Aplicar apenas em rotas de API
export const config = {
  matcher: '/api/:path*',
}

export function middleware(request: NextRequest) {
  // CSRF: Bloquear requisições sem Origin válido em rotas de API
  if (request.method === 'POST') {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const requestOrigin = toOrigin(origin) || toOrigin(referer)
    const allowedOrigins = getAllowedOrigins()

    // Permitir same-origin automaticamente (útil em previews *.vercel.app)
    const host = request.headers.get('host')
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    if (host) {
      allowedOrigins.add(`${proto}://${host}`)
    }

    if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
      return NextResponse.json(
        { message: 'Requisição não autorizada.' },
        { status: 403 }
      )
    }
  }

  return NextResponse.next()
}
