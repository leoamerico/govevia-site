/**
 * POST /api/admin/kernel/task/dispatch
 *
 * Proxy server-side para POST /api/v1/tasks/dispatch no backend FastAPI.
 * O browser nunca toca o JWT nem a URL do backend.
 *
 * Body: { handler: string; payload?: Record<string, unknown> }
 * Response 202: { task_id, handler, status: "pending" }
 * Response 422: { error, available }  — handler inválido
 * Response 503: { error, mode: "down" } — backend indisponível
 */
import { NextRequest, NextResponse } from 'next/server'
import { dispatchTask, KernelUnavailableError } from '@/lib/kernel/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: { handler?: unknown; payload?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'body JSON inválido' }, { status: 400 })
  }

  const handler = typeof body.handler === 'string' ? body.handler.trim() : ''
  if (!handler) {
    return NextResponse.json({ error: '"handler" é obrigatório' }, { status: 400 })
  }

  const payload =
    body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : {}

  try {
    const result = await dispatchTask({ handler, payload })
    return NextResponse.json(result, { status: 202 })
  } catch (err) {
    if (err instanceof KernelUnavailableError) {
      return NextResponse.json({ error: err.message, mode: 'down' }, { status: 503 })
    }
    const msg = err instanceof Error ? err.message : String(err)
    // Repassa 422 do backend (handler inválido) como 422
    if (msg.includes('HTTP 422') || msg.includes('422')) {
      return NextResponse.json({ error: msg }, { status: 422 })
    }
    console.error('[dispatch-proxy]', err)
    return NextResponse.json({ error: 'erro interno' }, { status: 500 })
  }
}
