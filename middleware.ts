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

const ADMIN_404 = new NextResponse('Not Found', {
  status: 404,
  headers: {
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex, nofollow',
  },
})

async function enforceAdminAuth(_request: NextRequest): Promise<NextResponse> {
  // BOUNDARY: site-public não tem admin funcional.
  // O admin real vive em apps/ceo-console (porta 3001). Aqui, mantemos apenas:
  // - /admin         → redirect para /admin/login
  // - /admin/login   → (a) redirect para CEO Console se configurado, ou (b) página informativa
  // - demais /admin/* → 404 (superfície fechada)
  const request = _request
  const { pathname, search } = request.nextUrl

  // Canonicalização: aceitar variações de casing (ex.: /admin/Login) e normalizar.
  if (pathname.toLowerCase() === '/admin/login' && pathname !== '/admin/login') {
    const res = NextResponse.redirect(new URL(`/admin/login${search}`, request.url), 307)
    res.headers.set('cache-control', 'no-store')
    res.headers.set('x-robots-tag', 'noindex, nofollow')
    return res
  }

  const hardHeaders = {
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex, nofollow',
  }

  if (pathname === '/admin' || pathname === '/admin/') {
    const res = NextResponse.redirect(new URL('/admin/login', request.url), 307)
    for (const [k, v] of Object.entries(hardHeaders)) res.headers.set(k, v)
    return res
  }

  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    const ceoBaseRaw = process.env.CEO_CONSOLE_BASE_URL || process.env.NEXT_PUBLIC_CEO_CONSOLE_BASE_URL
    const ceoBase = toOrigin(ceoBaseRaw ?? null)

    if (ceoBase) {
      const correlationId = globalThis.crypto?.randomUUID?.() ?? `cid_${Date.now()}_${Math.random().toString(16).slice(2)}`

      const healthz = new URL('/api/healthz', ceoBase)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 1200)

      try {
        const r = await fetch(healthz.toString(), {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
          headers: { 'user-agent': 'govevia-site-middleware/healthz' },
        })

        if (r.ok) {
          const target = new URL(`/admin/login${search}`, ceoBase)
          const res = NextResponse.redirect(target, 307)
          for (const [k, v] of Object.entries(hardHeaders)) res.headers.set(k, v)
          res.headers.set('x-govevia-correlation-id', correlationId)
          return res
        }

        console.error(
          JSON.stringify({
            event_type: 'ADMIN_CONSOLE_UNHEALTHY',
            correlation_id: correlationId,
            healthz: healthz.toString(),
            status: r.status,
          })
        )
      } catch (err) {
        console.error(
          JSON.stringify({
            event_type: 'ADMIN_CONSOLE_UNHEALTHY',
            correlation_id: correlationId,
            healthz: healthz.toString(),
            error: String(err),
          })
        )
      } finally {
        clearTimeout(timeout)
      }

      const html503 = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>Console indisponível</title>
  </head>
  <body>
    <main style="max-width: 720px; margin: 40px auto; padding: 0 16px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.45;">
      <h1 style="margin: 0 0 12px; font-size: 20px;">Console administrativo indisponível</h1>
      <p style="margin: 0 0 12px;">O site público detectou que o destino configurado para o CEO Console não respondeu ao health-check.</p>
      <p style="margin: 0 0 12px;"><strong>Correlation ID:</strong> <code>${correlationId}</code></p>
      <p style="margin: 0 0 12px;">Tente novamente em instantes. Se persistir, valide o deploy do CEO Console e o DNS do domínio configurado.</p>
      <p style="margin: 0; color: #555;">(Falha explícita por governança — este endpoint nunca redireciona às cegas.)</p>
    </main>
  </body>
</html>`

      const res = new NextResponse(html503, {
        status: 503,
        headers: {
          ...hardHeaders,
          'content-type': 'text/html; charset=utf-8',
          'x-govevia-correlation-id': correlationId,
        },
      })
      return res
    }

    const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>Acesso administrativo</title>
  </head>
  <body>
    <main style="max-width: 720px; margin: 40px auto; padding: 0 16px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.45;">
      <h1 style="margin: 0 0 12px; font-size: 20px;">Acesso administrativo</h1>
      <p style="margin: 0 0 12px;">Esta área é <strong>restrita</strong> e não é servida pelo site público.</p>
      <p style="margin: 0 0 12px;">O console administrativo vive no <strong>CEO Console</strong> (<code>apps/ceo-console</code>), com controles de sessão e postura fail-closed.</p>

      <h2 style="margin: 16px 0 8px; font-size: 16px;">Para equipe interna</h2>
      <p style="margin: 0 0 12px;">Se você precisa acessar o Admin via este domínio, habilite o redirecionamento configurando <code>CEO_CONSOLE_BASE_URL</code> (ex.: <code>https://ceo-console.seu-dominio</code>).</p>
      <p style="margin: 0; color: #555;">(Página gerada pelo middleware — demais rotas <code>/admin/*</code> permanecem fechadas.)</p>
    </main>
  </body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        ...hardHeaders,
        'content-type': 'text/html; charset=utf-8',
      },
    })
  }

  return ADMIN_404
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
