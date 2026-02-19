'use client'
/**
 * ComplianceWidget — FE-4
 *
 * Exibe contagem de WorkItems OPEN por área, consumindo o
 * Govevia Kernel via proxy /api/kernel/ewl/work-items.
 *
 * Estados:
 *   loading   — esqueleto
 *   stub      — kernel não configurado (GOVEVIA_KERNEL_BASE_URL vazia)
 *   error     — kernel configurado mas sem resposta
 *   data      — contagens por área + total
 */
import { useEffect, useState } from 'react'
import type { WorkItemDto, KernelStubResponse } from '@/lib/kernel.types'
import { isStub } from '@/lib/kernel.types'

type Status = 'loading' | 'stub' | 'error' | 'ok'

interface AreaCount {
  area: string
  count: number
}

const NEXUS_URL = process.env.NEXT_PUBLIC_NEXUS_UI_URL ?? null

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: {
    border: '1px solid #334155',
    borderRadius: 8,
    background: '#1e293b',
    padding: '1rem 1.25rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  } as React.CSSProperties,
  link: {
    fontSize: '0.72rem',
    color: '#0059B3',
    textDecoration: 'none',
    fontWeight: 600,
  } as React.CSSProperties,
  disabledLink: {
    fontSize: '0.72rem',
    color: '#334155',
    textDecoration: 'none',
    fontWeight: 600,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  grid: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  areaCard: (highlight: boolean) => ({
    background: '#0f172a',
    border: `1px solid ${highlight ? '#0059B3' : '#334155'}`,
    borderRadius: 6,
    padding: '0.5rem 0.85rem',
    minWidth: 90,
    textAlign: 'center' as const,
  } as React.CSSProperties),
  areaCount: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#f1f5f9',
    lineHeight: 1.1,
  } as React.CSSProperties,
  areaLabel: {
    fontSize: '0.65rem',
    color: '#94a3b8',
    marginTop: '0.15rem',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  pill: (color: string) => ({
    display: 'inline-block',
    background: color + '22',
    border: `1px solid ${color}`,
    color,
    borderRadius: 12,
    padding: '0.1rem 0.55rem',
    fontSize: '0.65rem',
    fontWeight: 700,
    marginLeft: '0.4rem',
  } as React.CSSProperties),
  stubBox: {
    color: '#475569',
    fontSize: '0.78rem',
    fontStyle: 'italic',
    padding: '0.5rem 0',
  } as React.CSSProperties,
  errorBox: {
    color: '#f87171',
    fontSize: '0.78rem',
    padding: '0.5rem 0',
  } as React.CSSProperties,
  skeleton: {
    display: 'flex',
    gap: '0.75rem',
  } as React.CSSProperties,
  skeletonCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 6,
    width: 90,
    height: 56,
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties,
}

export function ComplianceWidget() {
  const [status, setStatus] = useState<Status>('loading')
  const [areas, setAreas] = useState<AreaCount[]>([])
  const [total, setTotal] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/kernel/ewl/work-items?state=OPEN', {
          cache: 'no-store',
        })

        if (cancelled) return

        if (res.status === 503) {
          const body = (await res.json()) as KernelStubResponse | unknown
          if (isStub(body)) { setStatus('stub'); return }
        }

        if (!res.ok) {
          setErrorMsg(`HTTP ${res.status}`)
          setStatus('error')
          return
        }

        const items = (await res.json()) as WorkItemDto[]
        if (cancelled) return

        const open = items.filter((i) => i.state === 'OPEN')
        const byArea = new Map<string, number>()
        for (const item of open) {
          const key = item.area ?? '(sem área)'
          byArea.set(key, (byArea.get(key) ?? 0) + 1)
        }

        const sorted: AreaCount[] = Array.from(byArea.entries())
          .map(([area, count]) => ({ area, count }))
          .sort((a, b) => b.count - a.count)

        setAreas(sorted)
        setTotal(open.length)
        setStatus('ok')
      } catch (e) {
        if (cancelled) return
        setErrorMsg(e instanceof Error ? e.message : String(e))
        setStatus('error')
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <span style={S.sectionTitle}>
          Work Items — Kernel EWL
          {status === 'ok' && (
            <span style={S.pill('#22c55e')}>{total} OPEN</span>
          )}
        </span>
        {NEXUS_URL ? (
          <a href={`${NEXUS_URL}/projects`} target="_blank" rel="noopener" style={S.link}>
            Ver todos →
          </a>
        ) : (
          <span style={S.disabledLink} title="NEXT_PUBLIC_NEXUS_UI_URL não configurado">
            Ver todos →
          </span>
        )}
      </div>

      {/* Body */}
      {status === 'loading' && (
        <div style={S.skeleton}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={S.skeletonCard} />)}
        </div>
      )}

      {status === 'stub' && (
        <div style={S.stubBox}>
          Funcionalidade prevista — kernel não configurado (GAP-EWL-001).<br />
          Configure <code style={{ color: '#64748b' }}>GOVEVIA_KERNEL_BASE_URL</code> no <code style={{ color: '#64748b' }}>.env.local</code> para ativar.
        </div>
      )}

      {status === 'error' && (
        <div style={S.errorBox}>
          Erro ao conectar ao kernel: {errorMsg}
        </div>
      )}

      {status === 'ok' && areas.length === 0 && (
        <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
          Nenhum work item OPEN no momento.
        </div>
      )}

      {status === 'ok' && areas.length > 0 && (
        <div style={S.grid}>
          {areas.map(({ area, count }) => (
            <div key={area} style={S.areaCard(count >= 5)}>
              <div style={S.areaCount}>{count}</div>
              <div style={S.areaLabel}>{area}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
