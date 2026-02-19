/**
 * POST /api/admin/documents/ingest
 *
 * Proxy server-side para POST /api/v1/documents/upload no backend FastAPI.
 * Recebe multipart/form-data do browser, adiciona Bearer JWT do service account,
 * e encaminha ao backend. Retorna { job_id, status:"queued" } com HTTP 202.
 *
 * Erros mapeados:
 *  400 — arquivo não é PDF (detail do backend repassado)
 *  503 — backend indisponível
 *  500 — erro inesperado
 */
import { NextRequest, NextResponse } from 'next/server'
import { ingestDocument, KernelUnavailableError } from '@/lib/kernel/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Esperado multipart/form-data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Campo "file" ausente ou inválido' }, { status: 400 })
  }

  try {
    const result = await ingestDocument(formData)
    return NextResponse.json(result, { status: 202 })
  } catch (err) {
    if (err instanceof KernelUnavailableError) {
      const msg = err.message
      // Repassar 400 do backend (ex: "Only PDFs are supported") como 400
      if (msg.includes('400') || msg.toLowerCase().includes('pdf')) {
        return NextResponse.json({ error: msg }, { status: 400 })
      }
      return NextResponse.json({ error: msg, mode: 'down' }, { status: 503 })
    }
    console.error('[documents/ingest]', err)
    return NextResponse.json({ error: 'erro interno' }, { status: 500 })
  }
}
