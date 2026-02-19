/**
 * POST /api/admin/documents/search
 *
 * Proxy server-side para POST /api/v1/search no backend FastAPI.
 * Autenticado com Bearer JWT do service account.
 *
 * Backend implementado em govevia `2d28d372`.
 * Request:  { query: string, limit?: number (1-50) }
 * Response backend: { query, chunks: ChunkResult[], kernel_available: bool }
 *
 * Body BFF: { query: string; top_k?: number }
 * Response 200: { chunks: ChunkResult[], kernelAvailable: true }
 * Response 200 (stub): { chunks: ChunkResult[], kernelAvailable: false, stub: true }
 * Response 400: { error } — query vazia
 * Response 503: nunca exposto — cai em stub silencioso
 */
import { NextRequest, NextResponse } from 'next/server'
import { kernelFetch, KernelUnavailableError } from '@/lib/kernel/client'

export const dynamic = 'force-dynamic'

interface ChunkResult {
  chunk_id: string
  document_id: string
  score: number
  excerpt: string
}

const STUB_CHUNKS: ChunkResult[] = [
  {
    chunk_id: 'stub-c1',
    document_id: 'stub-doc-1',
    score: 0.91,
    excerpt: '[STUB] Resultado simulado — kernel não configurado ou indisponível.',
  },
  {
    chunk_id: 'stub-c2',
    document_id: 'stub-doc-1',
    score: 0.78,
    excerpt: '[STUB] Configure GOVEVIA_KERNEL_BASE_URL para resultados reais.',
  },
]

export async function POST(req: NextRequest) {
  let body: { query?: unknown; top_k?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'body JSON inválido' }, { status: 400 })
  }

  const query = typeof body.query === 'string' ? body.query.trim() : ''
  if (!query) {
    return NextResponse.json({ error: 'campo "query" obrigatório' }, { status: 400 })
  }

  const top_k = typeof body.top_k === 'number' ? body.top_k : 5

  try {
    const res = await kernelFetch('/api/v1/search', {
      method: 'POST',
      body: JSON.stringify({ query, limit: top_k }),
    })

    if (!res.ok) {
      // Backend retornou erro — degradar para stub
      console.warn(`[search-proxy] backend retornou ${res.status}, usando stub`)
      return NextResponse.json({ chunks: STUB_CHUNKS, kernelAvailable: false, stub: true })
    }

    const data = (await res.json()) as { chunks?: ChunkResult[]; kernel_available?: boolean }
    return NextResponse.json({ chunks: data.chunks ?? [], kernelAvailable: data.kernel_available ?? true })
  } catch (err) {
    if (err instanceof KernelUnavailableError) {
      return NextResponse.json({ chunks: STUB_CHUNKS, kernelAvailable: false, stub: true })
    }
    console.error('[search-proxy]', err)
    return NextResponse.json({ chunks: STUB_CHUNKS, kernelAvailable: false, stub: true })
  }
}
