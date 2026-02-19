/**
 * GET /api/admin/documents/ingest/status/[jobId]
 *
 * Proxy server-side para GET /api/v1/documents/upload/status/{job_id}.
 * Status possíveis: "queued" | "processing" | "done" | "error"
 *
 * Casos especiais:
 *  404 — job não encontrado (id inválido ou container reiniciou)
 *        → mensagem amigável: "Ingestão interrompida — reenvie o arquivo"
 *  503 — backend indisponível
 */
import { NextRequest, NextResponse } from 'next/server'
import { getDocJobState, KernelUnavailableError } from '@/lib/kernel/client'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params

  if (!jobId || !/^[\w-]+$/.test(jobId)) {
    return NextResponse.json({ error: 'jobId inválido' }, { status: 400 })
  }

  try {
    const state = await getDocJobState(jobId)
    if (state === null) {
      return NextResponse.json(
        { error: 'Ingestão interrompida — reenvie o arquivo', interrupted: true },
        { status: 404 }
      )
    }
    return NextResponse.json(state)
  } catch (err) {
    if (err instanceof KernelUnavailableError) {
      return NextResponse.json({ error: err.message, mode: 'down' }, { status: 503 })
    }
    console.error('[documents/ingest/status]', err)
    return NextResponse.json({ error: 'erro interno' }, { status: 500 })
  }
}
