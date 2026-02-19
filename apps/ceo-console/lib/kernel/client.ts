/**
 * lib/kernel/client.ts
 *
 * Cliente server-side para o backend FastAPI (GOVEVIA_KERNEL_BASE_URL).
 *
 * Responsabilidades:
 *  - Adquirir e cachear JWT do backend (service account)
 *  - Expor `kernelFetch(path, opts)` — wrapper autenticado
 *  - Expor `kernelGet(path)` — GET sem auth (para endpoints públicos)
 *  - Modo stub: quando GOVEVIA_KERNEL_BASE_URL não está definido,
 *    lança KernelUnavailableError — o chamador decide o fallback
 *
 * Auth federation:
 *  GOVEVIA_BACKEND_SERVICE_EMAIL + GOVEVIA_BACKEND_SERVICE_PASSWORD
 *  → POST /api/v1/auth/login → access_token (cached até 90% do TTL)
 */

export class KernelUnavailableError extends Error {
  constructor(reason: string) {
    super(`[kernel] unavailable: ${reason}`)
    this.name = 'KernelUnavailableError'
  }
}

// ─── Token cache (módulo singleton — válido pelo lifetime do processo) ────────

interface TokenCache {
  token: string
  expiresAt: number // epoch ms
}

let _tokenCache: TokenCache | null = null
const TOKEN_REFRESH_BUFFER_MS = 60_000 // Renovar 60s antes de expirar

function getBase(): string {
  const base = process.env.GOVEVIA_KERNEL_BASE_URL
  if (!base) throw new KernelUnavailableError('GOVEVIA_KERNEL_BASE_URL não configurado')
  return base.replace(/\/$/, '')
}

async function acquireToken(base: string): Promise<string> {
  const email = process.env.CEO_SERVICE_EMAIL
  const password = process.env.CEO_SERVICE_PASSWORD
  if (!email || !password) {
    throw new KernelUnavailableError(
      'CEO_SERVICE_EMAIL / CEO_SERVICE_PASSWORD não configurados'
    )
  }

  const res = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(5000),
  })

  if (!res.ok) {
    throw new KernelUnavailableError(`auth/login retornou HTTP ${res.status}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in?: number }
  // Assume 55 min TTL se expires_in não informado (segurança conservadora)
  const ttlMs = (data.expires_in ?? 3300) * 1000
  const expiresAt = Date.now() + ttlMs - TOKEN_REFRESH_BUFFER_MS

  _tokenCache = { token: data.access_token, expiresAt }
  return data.access_token
}

async function getToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.token
  }
  const base = getBase()
  return acquireToken(base)
}

// ─── GET público (sem auth) ───────────────────────────────────────────────────

export async function kernelGet(path: string): Promise<Response> {
  const base = getBase()
  return fetch(`${base}${path}`, {
    signal: AbortSignal.timeout(5000),
    // sem cache — dados de operação
    cache: 'no-store',
  })
}

// ─── Fetch autenticado ────────────────────────────────────────────────────────

export async function kernelFetch(
  path: string,
  opts: RequestInit = {}
): Promise<Response> {
  const base = getBase()
  const token = await getToken()

  return fetch(`${base}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  })
}

// ─── Helper: normas (endpoint público) ───────────────────────────────────────

export interface NormaLegalBackend {
  id: string
  titulo: string
  lei: string
  artigo: string
  esfera_legal: 'federal' | 'estadual' | 'municipal'
  vigencia_inicio: string
  vigencia_fim: string | null
  descricao: string
  status: 'ativa' | 'revogada' | 'suspensa'
  created_at: string
  updated_at: string
}

export async function fetchNormasFromBackend(): Promise<NormaLegalBackend[]> {
  const res = await kernelGet('/api/v1/normas-legais/')
  if (!res.ok) throw new KernelUnavailableError(`normas-legais retornou HTTP ${res.status}`)
  const data = (await res.json()) as { total: number; items: NormaLegalBackend[] }
  return data.items
}

// ─── Task polling ─────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'running' | 'success' | 'failed'

export interface TaskState {
  task_id: string
  handler: string
  status: TaskStatus
  result?: unknown
  error?: string | null
  created_at: number
  started_at?: number | null
  finished_at?: number | null
  elapsed_ms?: number | null
}

/**
 * Consulta o estado de uma tarefa assíncrona pelo task_id.
 * Retorna null se não encontrada (expirada ou inexistente).
 */
export async function getTaskState(taskId: string): Promise<TaskState | null> {
  const res = await kernelFetch(`/api/v1/tasks/${encodeURIComponent(taskId)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new KernelUnavailableError(`tasks/${taskId} retornou HTTP ${res.status}`)
  return (await res.json()) as TaskState
}
