/**
 * GET /api/admin/kernel/task/[taskId]
 *
 * Proxy server-side para GET /api/v1/tasks/{task_id} no backend FastAPI.
 * Necessário porque `getTaskState` usa `kernelFetch` (server-only, Node.js).
 * O cliente chama esta rota de dentro do browser.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getTaskState, KernelUnavailableError } from '@/lib/kernel/client'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const { taskId } = params

  if (!taskId || !/^[\w-]+$/.test(taskId)) {
    return NextResponse.json({ error: 'taskId inválido' }, { status: 400 })
  }

  try {
    const state = await getTaskState(taskId)
    if (state === null) {
      return NextResponse.json({ error: 'task não encontrada' }, { status: 404 })
    }
    return NextResponse.json(state)
  } catch (err) {
    if (err instanceof KernelUnavailableError) {
      return NextResponse.json({ error: err.message, mode: 'down' }, { status: 503 })
    }
    console.error('[task-proxy] erro inesperado:', err)
    return NextResponse.json({ error: 'erro interno' }, { status: 500 })
  }
}
