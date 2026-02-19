'use client'

/**
 * hooks/usePollDocJob.ts
 *
 * Hook cliente para acompanhar o ciclo de vida de um job de ingestão de documento.
 * Sistema SEPARADO do usePollTask — aponta para /api/admin/documents/ingest/status/{jobId}.
 *
 * Statuses terminais : "done" | "error"
 * Statuses em andamento: "queued" | "processing"
 *
 * Caso especial — 404 após restart: retorna interrupted=true, isLoading=false,
 * error="Ingestão interrompida — reenvie o arquivo"
 *
 * Uso:
 *   const { state, isLoading, error, interrupted } = usePollDocJob(jobId)
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { DocJobState } from '@/lib/kernel/client'

export type { DocJobState }

const POLL_INTERVAL_MS = 1_500
const MAX_POLLS = 120 // 3 min

export interface UsePollDocJobResult {
  state: DocJobState | null
  isLoading: boolean
  error: string | null
  /** true quando job não foi encontrado (container reiniciou) */
  interrupted: boolean
  refresh: () => void
  reset: () => void
}

export function usePollDocJob(jobId: string | null): UsePollDocJobResult {
  const [state, setState]           = useState<DocJobState | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [interrupted, setInterrupt] = useState(false)
  const pollCount                   = useRef(0)
  const timerRef                    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const poll = useCallback(async (id: string) => {
    pollCount.current += 1

    if (pollCount.current > MAX_POLLS) {
      setError('Timeout: ingestão não concluiu em 3 minutos')
      return
    }

    try {
      const res = await fetch(
        `/api/admin/documents/ingest/status/${encodeURIComponent(id)}`,
        { cache: 'no-store' }
      )

      if (res.status === 404) {
        const body = await res.json().catch(() => ({}))
        const interrupted = (body as { interrupted?: boolean }).interrupted ?? false
        setInterrupt(interrupted)
        setError(
          interrupted
            ? 'Ingestão interrompida — reenvie o arquivo'
            : 'Job não encontrado'
        )
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError((body as { error?: string }).error ?? `HTTP ${res.status}`)
        return
      }

      const job = (await res.json()) as DocJobState
      setState(job)

      if (job.status === 'queued' || job.status === 'processing') {
        timerRef.current = setTimeout(() => poll(id), POLL_INTERVAL_MS)
      }
    } catch {
      setError('Erro de rede ao consultar status da ingestão')
    }
  }, [])

  useEffect(() => {
    if (!jobId) return

    setState(null)
    setError(null)
    setInterrupt(false)
    pollCount.current = 0
    clearTimer()

    poll(jobId)

    return () => clearTimer()
  }, [jobId, poll])

  const refresh = useCallback(() => {
    if (!jobId) return
    clearTimer()
    poll(jobId)
  }, [jobId, poll])

  const reset = useCallback(() => {
    clearTimer()
    setState(null)
    setError(null)
    setInterrupt(false)
    pollCount.current = 0
  }, [])

  const isLoading =
    jobId !== null &&
    !interrupted &&
    error === null &&
    (state === null || state.status === 'queued' || state.status === 'processing')

  return { state, isLoading, error, interrupted, refresh, reset }
}
