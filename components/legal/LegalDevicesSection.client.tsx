'use client'

/**
 * components/legal/LegalDevicesSection.client.tsx
 * ────────────────────────────────────────────────────────
 * Exibe os dispositivos legais consumidos via /api/core/leis
 * (BFF kernel-first com fallback estático).
 *
 * Suporta filtro por esfera legal e busca por texto livre.
 * ────────────────────────────────────────────────────────
 */

import { useEffect, useState } from 'react'
import type { LegalDevicesPayload, NormaLegal } from '@/lib/kernel/types'

// ── Badge de esfera ───────────────────────────────────────
const ESFERA_LABEL: Record<string, string> = {
  federal: 'Federal',
  estadual: 'Estadual',
  municipal: 'Municipal',
}

const ESFERA_COLOR: Record<string, string> = {
  federal: 'bg-sky-900/60 text-sky-300 border-sky-700',
  estadual: 'bg-violet-900/60 text-violet-300 border-violet-700',
  municipal: 'bg-amber-900/60 text-amber-300 border-amber-700',
}

// ── Cartão individual ─────────────────────────────────────
function NormaCard({ norma }: { norma: NormaLegal }) {
  const esfLabel = ESFERA_LABEL[norma.esfLegal] ?? norma.esfLegal
  const esfColor = ESFERA_COLOR[norma.esfLegal] ?? 'bg-white/5 text-gray-300 border-white/10'

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20 hover:bg-white/8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${esfColor}`}
        >
          {esfLabel}
        </span>
        {norma.status !== 'ativa' && (
          <span className="inline-flex items-center rounded border border-red-700 bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-300">
            {norma.status}
          </span>
        )}
      </div>

      {/* Título */}
      <h3 className="font-sans text-sm font-semibold leading-snug text-white">
        {norma.label}
      </h3>

      {/* Lei + Artigo */}
      {(norma.lei || norma.artigo) && (
        <p className="font-mono text-xs text-gray-400">
          {[norma.lei, norma.artigo].filter(Boolean).join(' — ')}
        </p>
      )}

      {/* Conteúdo / Ementa */}
      <p className="text-sm leading-relaxed text-gray-300">{norma.content}</p>

      {/* Vigência */}
      {norma.effectiveStart && (
        <p className="mt-auto font-mono text-xs text-gray-500">
          Vigência: {norma.effectiveStart}
          {norma.effectiveEnd ? ` → ${norma.effectiveEnd}` : ' (em vigor)'}
        </p>
      )}

      {/* URN Lex */}
      {norma.urnLex && (
        <p className="font-mono text-xs text-gray-600">{norma.urnLex}</p>
      )}
    </article>
  )
}

// ── Componente principal ──────────────────────────────────
interface Props {
  /** Filtra por esfera ao carregar; pode ser alterado via UI */
  defaultEsfera?: 'federal' | 'estadual' | 'municipal'
  /** Exibe badge indicando se os dados vêm do kernel ou do JSON estático */
  showSource?: boolean
}

export default function LegalDevicesSection({
  defaultEsfera,
  showSource = false,
}: Props) {
  const [esfera, setEsfera] = useState<string>(defaultEsfera ?? '')
  const [query, setQuery] = useState('')
  const [payload, setPayload] = useState<LegalDevicesPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)

    const params = new URLSearchParams()
    if (esfera) params.set('esfera', esfera)
    if (query.trim()) params.set('q', query.trim())
    params.set('status', 'ativa')

    fetch(`/api/core/leis?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json() as Promise<LegalDevicesPayload>
      })
      .then((data) => {
        setPayload(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [esfera, query])

  return (
    <section className="w-full">
      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Busca */}
        <input
          type="search"
          placeholder="Buscar norma, lei ou artigo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-white/25 focus:ring-0 sm:max-w-xs"
        />

        {/* Esfera */}
        <div className="flex gap-2">
          {(['', 'federal', 'estadual', 'municipal'] as const).map((val) => (
            <button
              key={val || 'all'}
              onClick={() => setEsfera(val)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                esfera === val
                  ? 'border-white/30 bg-white/15 text-white'
                  : 'border-white/10 bg-transparent text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {val === '' ? 'Todas' : ESFERA_LABEL[val]}
            </button>
          ))}
        </div>
      </div>

      {/* Estado: carregando */}
      {loading && (
        <div className="py-16 text-center text-sm text-gray-500">
          Carregando dispositivos legais…
        </div>
      )}

      {/* Estado: erro */}
      {!loading && error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-8 text-center text-sm text-red-400">
          Não foi possível carregar as normas. Tente novamente.
        </div>
      )}

      {/* Estado: vazio */}
      {!loading && !error && payload?.data.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-500">
          Nenhuma norma encontrada com os filtros aplicados.
        </div>
      )}

      {/* Grid de cartões */}
      {!loading && !error && payload && payload.data.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {payload.data.map((norma) => (
              <NormaCard key={norma.id} norma={norma} />
            ))}
          </div>

          {/* Rodapé de metadados */}
          <div className="mt-6 flex items-center justify-between text-xs text-gray-600">
            <span>{payload.total} dispositivo{payload.total !== 1 ? 's' : ''} encontrado{payload.total !== 1 ? 's' : ''}</span>
            {showSource && (
              <span className="font-mono">
                fonte:{' '}
                <span className={payload.source === 'kernel' ? 'text-green-600' : 'text-yellow-600'}>
                  {payload.source}
                </span>
              </span>
            )}
          </div>
        </>
      )}
    </section>
  )
}
