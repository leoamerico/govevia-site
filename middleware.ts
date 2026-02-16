import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
