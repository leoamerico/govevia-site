'use server'
/**
 * apps/ceo-console/app/admin/rag/actions.ts
 *
 * Server Actions para o demo RAG do kernel Govevia.
 *
 * INVARIÁVEIS:
 *  - Endpoint do kernel via GOVEVIA_KERNEL_BASE_URL (nunca hardcoded)
 *  - Registry append-only: apenas hash_payload, nunca conteúdo bruto
 *  - Degradação graciosa quando kernel não está disponível (demo standalone)
 */
import { appendFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UploadResult {
  ok: boolean
  documentId?: string
  fileName?: string
  chunksCreated?: number
  hash_payload: string
  kernelAvailable: boolean
  error?: string
}

export interface SearchResult {
  ok: boolean
  query_hash: string
  resultsCount: number
  kernelAvailable: boolean
  chunks: ChunkResult[]
  error?: string
}

export interface ChunkResult {
  chunk_id: string
  document_id: string
  score: number
  excerpt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function monorepoRoot(): string {
  return join(process.cwd(), '../..')
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

function registryAppend(event: Record<string, unknown>): void {
  const registryPath = join(monorepoRoot(), 'envneo', 'ops', 'REGISTRY-OPS.ndjson')
  if (!existsSync(registryPath)) return
  try {
    appendFileSync(registryPath, JSON.stringify(event) + '\n')
  } catch {
    // Registry write failure must not block the demo
  }
}

// ─── kernelBase — lido UMA vez por invocação, sem cache ──────────────────────

function getKernelBase(): string | null {
  return process.env.GOVEVIA_KERNEL_BASE_URL ?? null
}

// ─── Server Action: Upload ────────────────────────────────────────────────────

export async function uploadDoc(formData: FormData): Promise<UploadResult> {
  const file = formData.get('file') as File | null
  if (!file) {
    return { ok: false, hash_payload: '', kernelAvailable: false, error: 'Nenhum arquivo selecionado.' }
  }

  const hash_payload = sha256(`upload:${file.name}:${file.size}:${file.type}`)

  const kernelBase = getKernelBase()

  if (!kernelBase) {
    // Demo stub — kernel not configured
    registryAppend({
      ts: new Date().toISOString(),
      org_unit: 'GOVEVIA',
      type: 'SIMULATION',
      ref: 'RAG-DEMO-UPLOAD',
      use_case_id: 'UC01',
      rule_ids: ['RN01', 'RN04'],
      result: 'STUB',
      hash_payload,
      actor: 'demo',
      note: 'GOVEVIA_KERNEL_BASE_URL não configurado — resultado simulado',
    })
    return {
      ok: true,
      documentId: `stub-${hash_payload.slice(0, 8)}`,
      fileName: file.name,
      chunksCreated: 0,
      hash_payload,
      kernelAvailable: false,
    }
  }

  // Proxy para kernel real
  try {
    const kernelForm = new FormData()
    kernelForm.append('file', file)
    const res = await fetch(process.env.GOVEVIA_KERNEL_BASE_URL + '/api/v1/documentos/upload', {
      method: 'POST',
      body: kernelForm,
    })
    const json = await res.json() as Record<string, unknown>

    const result: UploadResult = {
      ok: res.ok,
      documentId: json.document_id as string | undefined,
      fileName: file.name,
      chunksCreated: json.chunks_created as number | undefined,
      hash_payload,
      kernelAvailable: true,
      error: res.ok ? undefined : String(json.error ?? res.statusText),
    }

    registryAppend({
      ts: new Date().toISOString(),
      org_unit: 'GOVEVIA',
      type: 'SIMULATION',
      ref: 'RAG-DEMO-UPLOAD',
      use_case_id: 'UC01',
      rule_ids: ['RN01', 'RN04'],
      result: res.ok ? 'PASS' : 'FAIL',
      hash_payload,
      document_id: result.documentId,
      chunks_created: result.chunksCreated,
      actor: 'demo',
    })

    return result
  } catch (err) {
    return {
      ok: false,
      hash_payload,
      kernelAvailable: true,
      error: `Erro ao chamar kernel: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}

// ─── Server Action: Search ────────────────────────────────────────────────────

export async function searchDocs(query: string): Promise<SearchResult> {
  if (!query.trim()) {
    return { ok: false, query_hash: '', resultsCount: 0, kernelAvailable: false, chunks: [], error: 'Query vazia.' }
  }

  const query_hash = sha256(`search:${query.trim()}`)

  const kernelBase = getKernelBase()

  if (!kernelBase) {
    // Demo stub
    const stubChunks: ChunkResult[] = [
      { chunk_id: 'stub-c1', document_id: 'stub-doc-1', score: 0.91, excerpt: '[STUB] Resultado simulado — kernel não configurado.' },
      { chunk_id: 'stub-c2', document_id: 'stub-doc-1', score: 0.78, excerpt: '[STUB] Configure GOVEVIA_KERNEL_BASE_URL para resultados reais.' },
    ]
    registryAppend({
      ts: new Date().toISOString(),
      org_unit: 'GOVEVIA',
      type: 'SIMULATION',
      ref: 'RAG-DEMO-SEARCH',
      use_case_id: 'UC03',
      rule_ids: ['RN01', 'RN02', 'RN05'],
      result: 'STUB',
      query_hash,
      resultsCount: stubChunks.length,
      topChunkIds: stubChunks.map(c => c.chunk_id),
      actor: 'demo',
      note: 'GOVEVIA_KERNEL_BASE_URL não configurado — resultado simulado',
    })
    return { ok: true, query_hash, resultsCount: stubChunks.length, kernelAvailable: false, chunks: stubChunks }
  }

  // Proxy para kernel real
  try {
    const res = await fetch(process.env.GOVEVIA_KERNEL_BASE_URL + '/api/v1/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim(), top_k: 5 }),
    })
    const json = await res.json() as { chunks?: ChunkResult[]; error?: string }

    const chunks = json.chunks ?? []
    registryAppend({
      ts: new Date().toISOString(),
      org_unit: 'GOVEVIA',
      type: 'SIMULATION',
      ref: 'RAG-DEMO-SEARCH',
      use_case_id: 'UC03',
      rule_ids: ['RN01', 'RN02', 'RN05'],
      result: res.ok ? 'PASS' : 'FAIL',
      query_hash,
      resultsCount: chunks.length,
      topChunkIds: chunks.slice(0, 3).map(c => c.chunk_id),
      actor: 'demo',
    })

    return {
      ok: res.ok,
      query_hash,
      resultsCount: chunks.length,
      kernelAvailable: true,
      chunks,
      error: res.ok ? undefined : String(json.error ?? res.statusText),
    }
  } catch (err) {
    return {
      ok: false,
      query_hash,
      resultsCount: 0,
      kernelAvailable: true,
      chunks: [],
      error: `Erro ao chamar kernel: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}
