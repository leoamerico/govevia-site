/**
 * /api/kernel/[...path]
 *
 * Proxy transparente para o Govevia Kernel (Spring Boot / FastAPI).
 * Rota base: ${GOVEVIA_KERNEL_BASE_URL}/api/v1/[...path]
 *
 * Se GOVEVIA_KERNEL_BASE_URL não estiver configurada, responde com
 * { stub: true, message: "kernel não configurado" } — status 503.
 *
 * Repassa query-string, body e Content-Type intactos.
 * Adiciona X-CEO-CONSOLE-PROXY para rastreio no backend.
 */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const revalidate = 0

type Params = { path: string[] }

async function proxy(req: NextRequest, params: Params, method: string): Promise<NextResponse> {
  const base = process.env.GOVEVIA_KERNEL_BASE_URL
  if (!base) {
    return NextResponse.json(
      { stub: true, message: 'GOVEVIA_KERNEL_BASE_URL não configurado — modo stub ativo' },
      { status: 503 }
    )
  }

  const pathStr = params.path.join('/')
  const search = req.nextUrl.search ?? ''
  const upstreamUrl = `${base}/api/v1/${pathStr}${search}`

  const headers: HeadersInit = {
    'Content-Type': req.headers.get('content-type') ?? 'application/json',
    'X-CEO-CONSOLE-PROXY': '1',
  }

  // Repassa chave de ingest se configurada (enforcement-snapshots)
  const ingestKey = process.env.GOVEVIA_KERNEL_INGEST_KEY
  if (ingestKey) headers['X-EWL-INGEST-KEY'] = ingestKey

  const init: RequestInit = {
    method,
    headers,
    signal: AbortSignal.timeout(8000),
  }

  if (method !== 'GET' && method !== 'HEAD') {
    init.body = req.body as BodyInit
    ;(init as Record<string, unknown>).duplex = 'half' // required for body streaming in Node
  }

  try {
    const upstream = await fetch(upstreamUrl, init)
    const body = await upstream.text()

    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
      },
    })
  } catch (err) {
    const message = err instanceof Error
      ? err.name === 'TimeoutError' ? 'timeout (>8s)' : err.message
      : String(err)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  return proxy(req, params, 'GET')
}
export async function POST(req: NextRequest, { params }: { params: Params }) {
  return proxy(req, params, 'POST')
}
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  return proxy(req, params, 'PUT')
}
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  return proxy(req, params, 'DELETE')
}
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  return proxy(req, params, 'PATCH')
}
