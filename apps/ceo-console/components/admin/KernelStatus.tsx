'use client'
/**
 * KernelStatus — widget de conectividade backend no nav do /admin.
 *
 * Faz poll de /api/admin/kernel/ping a cada 30s.
 * Estados visuais:
 *   ● LIVE  (verde)  — backend respondeu OK
 *   ● STUB  (âmbar)  — GOVEVIA_KERNEL_BASE_URL não configurado
 *   ● DOWN  (vermelho) — backend configurado mas sem resposta
 *   ○ ...   (cinza)  — verificando (estado inicial)
 */
import { useEffect, useState } from 'react'

interface PingResult {
  ok: boolean
  mode: 'live' | 'stub'
  latency_ms?: number
  error?: string
  backend_url?: string
}

type DisplayState = 'checking' | 'live' | 'stub' | 'down'

const POLL_INTERVAL_MS = 30_000

const STATE_STYLES: Record<DisplayState, { color: string; label: string; dot: string }> = {
  checking: { color: '#64748b', label: '...', dot: '○' },
  live:     { color: '#22c55e', label: 'LIVE', dot: '●' },
  stub:     { color: '#f59e0b', label: 'STUB', dot: '●' },
  down:     { color: '#ef4444', label: 'DOWN', dot: '●' },
}

export function KernelStatus() {
  const [state, setState] = useState<DisplayState>('checking')
  const [latency, setLatency] = useState<number | undefined>()
  const [tooltip, setTooltip] = useState<string>('Verificando backend...')

  async function check() {
    try {
      const res = await fetch('/api/admin/kernel/ping', { cache: 'no-store' })
      const data = (await res.json()) as PingResult

      if (data.mode === 'stub') {
        setState('stub')
        setLatency(undefined)
        setTooltip('GOVEVIA_KERNEL_BASE_URL não configurado — modo stub ativo')
      } else if (data.ok) {
        setState('live')
        setLatency(data.latency_ms)
        setTooltip(`Backend respondeu em ${data.latency_ms}ms — ${data.backend_url ?? ''}`)
      } else {
        setState('down')
        setLatency(data.latency_ms)
        setTooltip(`Backend offline: ${data.error ?? 'sem resposta'} — ${data.backend_url ?? ''}`)
      }
    } catch {
      setState('down')
      setLatency(undefined)
      setTooltip('Erro ao verificar /api/admin/kernel/ping')
    }
  }

  useEffect(() => {
    void check()
    const id = setInterval(() => { void check() }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const { color, label, dot } = STATE_STYLES[state]

  return (
    <span
      title={tooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.68rem',
        fontFamily: 'monospace',
        fontWeight: 700,
        color,
        letterSpacing: '0.05em',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: '0.6rem' }}>{dot}</span>
      {label}
      {latency !== undefined && (
        <span style={{ fontWeight: 400, color: '#64748b' }}>
          {latency}ms
        </span>
      )}
    </span>
  )
}
