/**
 * GET /api/admin/kernel/task/handlers
 *
 * Proxy server-side para GET /api/v1/tasks/handlers no backend FastAPI.
 * Retorna lista de handlers registrados no task queue.
 *
 * Response 200: { handlers: string[] }
 * Response 503: { error, mode: "down" }
 */
import { NextResponse } from 'next/server'
import { getTaskHandlers, KernelUnavailableError } from '@/lib/kernel/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const handlers = await getTaskHandlers()
    return NextResponse.json({ handlers })
  } catch (err) {
    if (err instanceof KernelUnavailableError) {
      return NextResponse.json({ error: err.message, mode: 'down' }, { status: 503 })
    }
    console.error('[handlers-proxy]', err)
    return NextResponse.json({ error: 'erro interno' }, { status: 500 })
  }
}
