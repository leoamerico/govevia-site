import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Aplicar apenas em rotas de API
export const config = {
  matcher: '/api/:path*',
}

export function middleware(request: NextRequest) {
  // CSRF: Bloquear requisições sem Origin válido em rotas de API
  if (request.method === 'POST') {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL || 'https://govevia.com.br',
      'http://localhost:3000',
    ]

    if (!origin || !allowedOrigins.some(o => origin.startsWith(o))) {
      return NextResponse.json(
        { message: 'Requisição não autorizada.' },
        { status: 403 }
      )
    }
  }

  return NextResponse.next()
}
