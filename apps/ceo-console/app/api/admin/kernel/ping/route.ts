/**
 * GET /api/admin/kernel/ping
 *
 * Testa conectividade com o backend FastAPI (GOVEVIA_KERNEL_BASE_URL).
 * Usado pelo widget KernelStatus no layout /admin.
 *
 * Resposta:
 *   {ok: true,  latency_ms, version?, mode: 'live'}   — backend respondeu
 *   {ok: false, error, mode: 'stub'}                   — conexão falhou
 *   {ok: false, error: 'not_configured', mode: 'stub'} — env var ausente
 */
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
// Sem cache — sempre resultado em tempo real
export const revalidate = 0

export async function GET() {
  const base = process.env.GOVEVIA_KERNEL_BASE_URL

  if (!base) {
    return NextResponse.json(
      { ok: false, error: 'not_configured', mode: 'stub' as const },
      { status: 503 }
    )
  }

  const start = Date.now()
  try {
    const res = await fetch(`${base}/api/v1/system/metrics`, {
      method: 'GET',
      // Timeout agressivo — fail-fast
      signal: AbortSignal.timeout(4000),
    })

    const latency_ms = Date.now() - start

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `HTTP ${res.status}`,
          latency_ms,
          mode: 'live' as const,
        },
        { status: 502 }
      )
    }

    // Tenta extrair versão do body (best-effort)
    let version: string | undefined
    try {
      const body = (await res.json()) as Record<string, unknown>
      version = typeof body.version === 'string' ? body.version : undefined
    } catch {
      // body não é JSON — ok, não é obrigatório
    }

    return NextResponse.json({
      ok: true,
      latency_ms,
      mode: 'live' as const,
      backend_url: base,
      ...(version ? { version } : {}),
    })
  } catch (err) {
    const latency_ms = Date.now() - start
    const message =
      err instanceof Error
        ? err.name === 'TimeoutError'
          ? 'timeout (>4s)'
          : err.message
        : String(err)

    return NextResponse.json(
      { ok: false, error: message, latency_ms, mode: 'live' as const },
      { status: 502 }
    )
  }
}
