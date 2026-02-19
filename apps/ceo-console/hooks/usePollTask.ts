'use client'

/**
 * hooks/usePollTask.ts
 *
 * Hook cliente para acompanhar o ciclo de vida de uma tarefa assíncrona
 * disparada pelo backend (qualquer endpoint que retorne 202 + task_id).
 *
 * Uso:
 *   const { state, isLoading, error } = usePollTask(taskId)
 *
 * - Enquanto taskId === null →  idle
 * - Enquanto status === 'pending' | 'running' → isLoading = true, poll a cada INTERVAL_MS
 * - Quando status === 'success' | 'failed' → para de pôr; isLoading = false
 * - Se o backend ficar indisponível (503) → error preenchido, isLoading = false
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// Importar apenas o tipo (não o valor) — o arquivo tem 'use client' no topo
import type { TaskState, TaskStatus } from '@/lib/kernel/client'

export type { TaskState, TaskStatus }

const POLL_INTERVAL_MS = 1_500 // 1,5s entre cada consulta
const MAX_POLLS = 120 // 3 min máximo antes de desistir

export interface UsePollTaskResult {
  /** Estado atual da tarefa (null = ainda não consultado) */
  state: TaskState | null
  /** true enquanto tarefa está pending|running */
  isLoading: boolean
  /** Mensagem de erro (backend down, task not found, timeout) */
  error: string | null
  /** Força nova consulta imediata */
  refresh: () => void
  /** Resetar para iniciar nova task */
  reset: () => void
}

export function usePollTask(taskId: string | null): UsePollTaskResult {
  const [state, setState] = useState<TaskState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollCount = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const poll = useCallback(async (id: string) => {
    pollCount.current += 1

    if (pollCount.current > MAX_POLLS) {
      setError('Timeout: tarefa não concluiu em 3 minutos')
      return
    }

    try {
      const res = await fetch(`/api/admin/kernel/task/${encodeURIComponent(id)}`, {
        cache: 'no-store',
      })

      if (res.status === 404) {
        setError('Tarefa não encontrada (expirada ou inexistente)')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setError((body as { error?: string }).error ?? `HTTP ${res.status}`)
        return
      }

      const task = (await res.json()) as TaskState
      setState(task)

      // Se ainda não terminal → agendar próxima consulta
      if (task.status === 'pending' || task.status === 'running') {
        timerRef.current = setTimeout(() => poll(id), POLL_INTERVAL_MS)
      }
    } catch {
      setError('Erro de rede ao consultar tarefa')
    }
  }, [])

  useEffect(() => {
    if (!taskId) return

    // Reset ao trocar taskId
    setState(null)
    setError(null)
    pollCount.current = 0
    clearTimer()

    // Início imediato
    poll(taskId)

    return () => clearTimer()
  }, [taskId, poll])

  const refresh = useCallback(() => {
    if (!taskId) return
    clearTimer()
    poll(taskId)
  }, [taskId, poll])

  const reset = useCallback(() => {
    clearTimer()
    setState(null)
    setError(null)
    pollCount.current = 0
  }, [])

  const isLoading =
    taskId !== null &&
    error === null &&
    (state === null || state.status === 'pending' || state.status === 'running')

  return { state, isLoading, error, refresh, reset }
}
